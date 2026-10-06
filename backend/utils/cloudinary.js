import {v2 as cloudinary} from "cloudinary";
import dotenv from "dotenv";
import getDataUri from "./datauri.js";
dotenv.config();

cloudinary.config({
    cloud_name:process.env.CLOUD_NAME,
    api_key:process.env.API_KEY,
    api_secret:process.env.API_SECRET
});

// uploads an in-memory multer file and returns its https url
export const uploadFile = async (file, folder) => {
    const fileUri = getDataUri(file);
    const isPdf = file.mimetype === "application/pdf";
    const cloudResponse = await cloudinary.uploader.upload(fileUri.content, {
        folder: `jobsetu/${folder}`,
        resource_type: isPdf ? "raw" : "image",
        ...(isPdf ? { public_id: `${Date.now()}-${Math.round(Math.random() * 1e6)}.pdf` } : {})
    });
    return cloudResponse.secure_url;
}

// Cloudinary accounts can block direct delivery of PDFs, so resumes are opened
// through a short-lived signed download link instead of their stored url.
export const getResumeDownloadUrl = (resumeUrl) => {
    const match = resumeUrl.match(new RegExp(`res\\.cloudinary\\.com/${process.env.CLOUD_NAME}/raw/upload/(?:v\\d+/)?(.+)$`));
    if (!match) return resumeUrl;
    return cloudinary.utils.private_download_url(decodeURIComponent(match[1]), "", {
        resource_type: "raw",
        type: "upload",
        expires_at: Math.floor(Date.now() / 1000) + 5 * 60
    });
}

export default cloudinary;
