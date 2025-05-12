import type { Request, Response } from "express";
import multer from "multer";
import sharp from "sharp";
import { uploadFileToS3 } from "../services/s3";

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only images
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

// Middleware to handle single file uploads
export const uploadMiddleware = upload.single("image");

/**
 * Process and upload an image to S3
 */
export async function handleImageUpload(req: Request, res: Response) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Process the image (resize and optimize)
    const processedImage = await sharp(req.file.buffer)
      .resize(1200, null, {
        withoutEnlargement: true, // Don't enlarge if smaller than 1200px
        fit: sharp.fit.inside,
      })
      .toBuffer();

    // Upload to S3
    const imageUrl = await uploadFileToS3(
      processedImage,
      req.file.mimetype
    );

    return res.status(200).json({ url: imageUrl });
  } catch (error) {
    console.error("Error processing/uploading image:", error);
    return res.status(500).json({
      error: "Failed to process or upload image",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}