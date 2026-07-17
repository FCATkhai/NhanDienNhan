import express, { Request, Response, NextFunction } from "express";
import multer from "multer";
import { processImagesWithOpenAI_chatCompletions } from "../services/analyze/imageProcessor.js";
import { receipt_prompt } from "../utils/prompts/receiptPrompt.js";
import type { ReceiptItem } from "../validation/receiptInfo.js";

const router = express.Router();

// Configure multer for in-memory file storage
const storage = multer.memoryStorage();

// Single upload handler for 1-10 images
const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    console.log("Receipt file field name:", file.fieldname, "MIME:", file.mimetype);
    // Only accept image files
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

// Custom error handler for multer
const handleMulterError = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.error("Multer error details for receipt:", {
    name: err.name,
    message: err.message,
    code: err.code,
    field: err.field,
  });

  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        error: "File size exceeds 10MB limit",
      });
    }
    return res.status(400).json({
      success: false,
      error: err.message || "File upload error",
    });
  }

  if (err) {
    return res.status(400).json({
      success: false,
      error: err.message || "File upload failed",
    });
  }

  next();
};

// POST endpoint for receipt image analysis (accepts 1-10 images)
router.post("/analyze", (req: Request, res: Response, next: NextFunction) => {
  upload.array("images", 10)(req, res, (err) => {
    if (err) {
      return handleMulterError(err, req, res, next);
    }
    next();
  });
});

router.post(
  "/analyze",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Check if files were uploaded
      if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          error:
            "No receipt image files provided. Make sure to send files with field name 'images'",
        });
      }

      const files = req.files as Express.Multer.File[];
      console.log("Receipt files received:", files.length);

      const imageBuffers = files.map((file) => file.buffer);
      const imageTypes = files.map((file) => file.mimetype);

      const result = await processImagesWithOpenAI_chatCompletions(
        imageBuffers,
        imageTypes,
        receipt_prompt,
        "receipt",
        /* isParsed */ true,
        /* formatDates */ true,
        /* withSearchSchema */ false,
      );

      result.response.data.items.forEach((item: ReceiptItem, index: number) => {
        if (item.quantity !== null && item.unit_price !== null && item.total_amount !== null) {
          if (item.quantity * item.unit_price !== item.total_amount) {
            // Tự động đẩy warning vào metadata bằng code logic của bạn
            result.response.metadata.review_warnings.push({
              field: `items.${index}.quantity`,
              issue: "MATH_MISMATCH",
              message: `Hệ thống tự động phát hiện: ${item.quantity} x ${item.unit_price} không bằng ${item.total_amount}`
            });
          }
        }
      });

      return res.status(200).json({
        success: true,
        data: {
          response: result.response,
          totalImages: files.length,
        },
      });
    } catch (error: any) {
      console.error("Receipt analysis error:", error);
      error.message = error.message || "Failed to analyze receipt images";
      next(error);
    }
  },
);

export default router;
