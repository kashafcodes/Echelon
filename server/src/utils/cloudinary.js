import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure .env is loaded whether run from /server or project root
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
dotenv.config();

export const isCloudinaryConfigured = () => {
  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;
  return Boolean(
    CLOUDINARY_CLOUD_NAME &&
    CLOUDINARY_API_KEY &&
    CLOUDINARY_API_SECRET &&
    CLOUDINARY_CLOUD_NAME !== "your_cloud_name" &&
    CLOUDINARY_API_KEY !== "your_api_key" &&
    CLOUDINARY_API_SECRET !== "your_api_secret"
  );
};

const configureCloudinary = () => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
};

configureCloudinary();

/**
 * Upload a local file path to Cloudinary, then delete the temp file.
 * @param {string} localFilePath - Absolute path to the temp file on disk.
 * @returns {object|null} Cloudinary response or null on failure.
 */
const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null;
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto",
            folder: "lokart/avatars",
        });
        fs.unlinkSync(localFilePath);
        return response;
    } catch (error) {
        // Clean up temp file even on failure
        try { fs.unlinkSync(localFilePath); } catch (_) {}
        console.error("[Cloudinary] File upload error:", error.message);
        return null;
    }
};

/**
 * Upload a Base64 Data URL directly to Cloudinary (no temp file needed).
 * Use this when receiving image data from the frontend as a Data URL string.
 * @param {string} base64DataUrl - e.g. "data:image/png;base64,iVBORw0..."
 * @param {object} options - Optional Cloudinary upload options.
 * @returns {object} Cloudinary response with { secure_url, public_id, ... }
 */
export const uploadBase64ToCloudinary = async (base64DataUrl, options = {}) => {
    if (!base64DataUrl || !base64DataUrl.startsWith("data:")) {
        throw new Error("Invalid image data. Expected a Base64 Data URL.");
    }

    if (!isCloudinaryConfigured()) {
        throw new Error("Cloudinary credentials are not configured in server/.env");
    }

    configureCloudinary();

    const response = await cloudinary.uploader.upload(base64DataUrl, {
        resource_type: "image",
        folder: "lokart/avatars",
        transformation: [
            { width: 400, height: 400, crop: "fill", gravity: "face" },
            { quality: "auto", fetch_format: "auto" },
        ],
        ...options,
    });

    return response; // { secure_url, public_id, width, height, ... }
};

/**
 * Delete an image from Cloudinary by its public_id.
 * @param {string} publicId - The Cloudinary public_id of the asset to remove.
 * @returns {object} Cloudinary deletion result.
 */
export const deleteFromCloudinary = async (publicId) => {
    if (!publicId) return null;
    if (!isCloudinaryConfigured()) return null;

    configureCloudinary();
    const result = await cloudinary.uploader.destroy(publicId, {
        resource_type: "image",
    });
    return result;
};

export default uploadOnCloudinary;