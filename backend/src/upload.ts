import multer from "multer";
import { ApiError } from "./errors.js";

const storage = multer.memoryStorage();

export const imageUpload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024, files: 1 },
  fileFilter: (_request, file, callback) => {
    if (!["image/jpeg", "image/png", "image/webp", "image/avif"].includes(file.mimetype)) {
      return callback(new ApiError(400, "invalid_image", "Upload a JPG, PNG, WebP, or AVIF image."));
    }
    return callback(null, true);
  },
});

export const resumeUpload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter: (_request, file, callback) => {
    if (file.mimetype !== "application/pdf") {
      return callback(new ApiError(400, "invalid_resume", "The resume must be a PDF."));
    }
    return callback(null, true);
  },
});