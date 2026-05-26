import express, { Request, Response, NextFunction } from "express";
import multer from "multer";
import {
  processImagesWithOpenAI,
  processImagesWithOpenAI_chatCompletions,
} from "../utils/imageProcessor";
import { pesticide_prompt, feed_prompt } from "../utils/prompts";

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

// POST endpoint for default image analysis (accepts 1-10 images)
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
    const schemaType =
      req.query.category === "fish_feed" ? "fish_feed" : "pesticide";
    console.log("Processing images for category:", schemaType);

    const files = req.files as Express.Multer.File[];

    console.log("Files received:", files.length);

    const prompt = schemaType === "fish_feed" ? feed_prompt : pesticide_prompt;
    const imageBuffers = files.map((file) => file.buffer);
    const imageTypes = files.map((file) => file.mimetype);

    const result = await processImagesWithOpenAI(
      imageBuffers,
      imageTypes,
      prompt,
      schemaType,
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
