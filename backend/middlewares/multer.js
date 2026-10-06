import multer from "multer";
import { ApiError } from "../utils/apiError.js";

const storage = multer.memoryStorage();
const limits = { fileSize: 5 * 1024 * 1024 };

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"];

const fileFilter = (req, file, cb) => {
    if (file.fieldname === "file" && req.uploadKind === "resume") {
        if (file.mimetype !== "application/pdf") return cb(new ApiError(400, "Resume must be a PDF file."));
        return cb(null, true);
    }
    if (!IMAGE_TYPES.includes(file.mimetype)) return cb(new ApiError(400, "Only image files are allowed."));
    cb(null, true);
}

// single image under the "file" field (profile photo on signup, company logo)
export const singleUpload = multer({ storage, limits, fileFilter }).single("file");

// profile update: "file" is the resume (PDF), "profilePhoto" is an image
export const profileUpload = (req, res, next) => {
    req.uploadKind = "resume";
    multer({ storage, limits, fileFilter }).fields([
        { name: "file", maxCount: 1 },
        { name: "profilePhoto", maxCount: 1 }
    ])(req, res, next);
}
