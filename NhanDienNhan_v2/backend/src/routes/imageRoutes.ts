import express, { Request, Response, NextFunction } from "express";
import multer from "multer";
import {
  processImageWithOpenAI,
  processMultipleImagesWithOpenAI,
} from "../utils/imageProcessor";

const router = express.Router();

// Configure multer for in-memory file storage
const storage = multer.memoryStorage();

// Single upload handler for 1-10 images
const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    console.log("File field name:", file.fieldname, "MIME:", file.mimetype);
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

const prompt = `
        Dựa vào hình ảnh, hãy trích xuất thông tin sản phẩm. Hãy cố gắng trích xuất thông tin chính xác nhất có thể và đánh giá độ tin cậy của thông tin đó. Những field không chỉ rõ trong hình ảnh có thể để trống hoặc null.

        Trả về JSON thoả mãn schema, chỉ trả về JSON, không giải thích gì thêm.
        `;

// Custom error handler for multer
const handleMulterError = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.error("Multer error details:", {
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

// POST endpoint for image analysis (accepts 1-10 images)
router.post("/analyze", (req: Request, res: Response, next: NextFunction) => {
  upload.array("images", 10)(req, res, (err) => {
    if (err) {
      return handleMulterError(err, req, res, next);
    }
    next();
  });
});

router.post("/analyze", async (req: Request, res: Response) => {
  try {
    // Check if files were uploaded
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        error:
          "No image files provided. Make sure to send files with field name 'images'",
      });
    }

    const files = req.files as Express.Multer.File[];
    // const { prompt } = req.body;

    console.log("Files received:", files.length);

    // If only 1 image, use single image processor
    if (files.length === 1 && files[0]) {
      const defaultPrompt = prompt || "what's in this image?";
      const result = await processImageWithOpenAI(
        files[0].buffer,
        files[0].mimetype,
        defaultPrompt,
      );

      return res.status(200).json({
        success: true,
        data: {
          response: result.response,
          fileName: files[0].originalname,
          mimeType: files[0].mimetype,
          totalImages: 1,
        },
      });
    }

    // If multiple images (2-10), use multiple images processor
    const defaultPrompt = prompt || "what's in these images?";
    const imageBuffers = files.map((file) => file.buffer);
    const imageTypes = files.map((file) => file.mimetype);

    const result = await processMultipleImagesWithOpenAI(
      imageBuffers,
      imageTypes,
      defaultPrompt,
    );

    return res.status(200).json({
      success: true,
      data: {
        response: result.response,
        totalImages: files.length,
      },
    });
  } catch (error: any) {
    console.error("Image analysis error:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to analyze images",
    });
  }
});

export default router;
