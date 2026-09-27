import { v2 as cloudinary } from "cloudinary";
import { env } from "./config.js";
import { ApiError } from "./errors.js";

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
  secure: true,
});

function configured() {
  return Boolean(env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET);
}

export async function uploadBuffer(
  buffer: Buffer,
  options: { folder: string; resourceType?: "image" | "raw"; filename?: string },
) {
  if (!configured()) throw new ApiError(503, "media_unavailable", "Cloudinary is not configured on the API.");

  return new Promise<{ secure_url: string; public_id: string; bytes: number; resource_type: string }>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: options.folder,
        resource_type: options.resourceType ?? "image",
        use_filename: true,
        unique_filename: true,
        filename_override: options.filename,
        overwrite: false,
      },
      (error, result) => {
        if (error || !result) return reject(new ApiError(502, "upload_failed", error?.message ?? "Upload failed."));
        return resolve(result as { secure_url: string; public_id: string; bytes: number; resource_type: string });
      },
    );
    stream.end(buffer);
  });
}

export async function destroyAsset(publicId: string, resourceType: "image" | "raw" = "image") {
  if (!configured() || !publicId) return;
  await cloudinary.uploader.destroy(publicId, { resource_type: resourceType, invalidate: true });
}