import express, { Request, Response, NextFunction } from "express";
import multer from "multer";
import { processImagesWithOpenAI_chatCompletions } from "../services/analyze/imageProcessor.js";
import { receipt_prompt } from "../utils/prompts/receiptPrompt.js";
import { reconcileDocumentMath } from "../utils/documentReconciler.js";
import { pdfToPng } from "pdf-to-png-converter";

const router = express.Router();

// Configure multer for in-memory file storage
const storage = multer.memoryStorage();

// Single upload handler for 1-10 images
const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    console.log("Receipt file field name:", file.fieldname, "MIME:", file.mimetype);
    // Accept image files and PDF
    if (file.mimetype.startsWith("image/") || file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only image and PDF files are allowed"));
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
            "No receipt files provided. Make sure to send files with field name 'images'",
        });
      }

      const files = req.files as Express.Multer.File[];
      console.log("Receipt files received:", files.length);

      const imageBuffers: Buffer[] = [];
      const imageTypes: string[] = [];

      for (const file of files) {
        if (file.mimetype === "application/pdf") {
          // Convert PDF pages to PNG buffers
          const pngPages = await pdfToPng(file.buffer, {
            viewportScale: 1.0, // scale to original size
          });

          pngPages.forEach((page) => {
            if (page.content) {
              imageBuffers.push(page.content);
              imageTypes.push("image/png");
            }
          });
        } else {
          imageBuffers.push(file.buffer);
          imageTypes.push(file.mimetype);
        }
      }

      console.log("Total resolved receipt images/pages:", imageBuffers.length);

      // Recheck the combined count limit of 10 pages/images
      if (imageBuffers.length > 10) {
        return res.status(400).json({
          success: false,
          error: `Total pages/images (${imageBuffers.length}) exceeds the maximum limit of 10.`,
        });
      }

      const result = await processImagesWithOpenAI_chatCompletions(
        imageBuffers,
        imageTypes,
        receipt_prompt,
        "receipt",
        /* isParsed */ true,
        /* formatDates */ true,
        /* withSearchSchema */ false,
      );

      // Perform mathematical reconciliations on the documents
      const reconciledResponse = reconcileDocumentMath(result.response);

      return res.status(200).json({
        success: true,
        data: {
          response: reconciledResponse,
          totalImages: imageBuffers.length,
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
