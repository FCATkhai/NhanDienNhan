import express, { Request, Response, NextFunction } from "express";
import multer from "multer";
import { SchemaType } from "../validation/type";
import {
  processImagesWithOpenAI,
  processImagesWithOpenAI_chatCompletions,
  processImagesTest,
} from "../utils/imageProcessor";
import {
  pesticide_prompt,
  feed_prompt,
  fertilizer_prompt,
  test_prompt,
} from "../utils/prompts";

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
    const schemaType: SchemaType = req.query.category as SchemaType;
    const isParsed = req.query.parsed === "true";
    const formatDates = req.query.formatDates === "true";
    console.log(
      "Processing images for category:",
      schemaType,
      "formatDates:",
      formatDates,
    );

    const files = req.files as Express.Multer.File[];

    console.log("Files received:", files.length);

    let prompt = "";
    switch (schemaType) {
      case "fish_feed":
        prompt = feed_prompt;
        break;
      case "pesticide":
        prompt = pesticide_prompt;
        break;
      case "fertilizer":
        prompt = fertilizer_prompt;
        break;
      default:
        prompt = pesticide_prompt; // default to pesticide prompt if category is missing or unrecognized
    }

    const imageBuffers = files.map((file) => file.buffer);
    const imageTypes = files.map((file) => file.mimetype);

    const result = await processImagesWithOpenAI_chatCompletions(
      imageBuffers,
      imageTypes,
      prompt,
      schemaType,
      isParsed,
      formatDates,
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

// POST endpoint for testing with custom prompt
router.post("/test", (req: Request, res: Response, next: NextFunction) => {
  upload.array("images", 10)(req, res, (err) => {
    if (err) {
      return handleMulterError(err, req, res, next);
    }
    next();
  });
});

router.post("/test", async (req: Request, res: Response) => {
  try {
    // Check if files were uploaded
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        error:
          "No image files provided. Make sure to send files with field name 'images'",
      });
    }
    const schemaType = "";
    console.log("Processing images for category:", schemaType);

    const files = req.files as Express.Multer.File[];

    console.log("Files received:", files.length);

    // const prompt = schemaType === "fish_feed" ? feed_prompt : pesticide_prompt;
    const prompt = test_prompt;
    const imageBuffers = files.map((file) => file.buffer);
    const imageTypes = files.map((file) => file.mimetype);

    const result = await processImagesTest(
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
