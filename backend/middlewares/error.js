import multer from "multer";

export const notFound = (req, res) => {
    return res.status(404).json({
        message: `Route ${req.method} ${req.originalUrl} not found.`,
        success: false
    });
}

// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, next) => {
    let status = err.status || 500;
    let message = err.message || "Something went wrong.";

    if (err.name === "CastError") {
        status = 400;
        message = "Invalid id.";
    } else if (err.name === "ValidationError") {
        status = 400;
        message = Object.values(err.errors).map((e) => e.message).join(" ");
    } else if (err.code === 11000) {
        status = 409;
        message = `${Object.keys(err.keyValue || {}).join(", ") || "Value"} already exists.`;
    } else if (err instanceof multer.MulterError) {
        status = 400;
        message = err.code === "LIMIT_FILE_SIZE" ? "File is too large. Maximum size is 5 MB." : err.message;
    } else if (err.type === "entity.parse.failed") {
        status = 400;
        message = "Invalid JSON body.";
    }

    if (status >= 500) {
        console.error(err);
        if (!err.status) message = "Something went wrong. Please try again.";
    }
    return res.status(status).json({ message, success: false });
}
