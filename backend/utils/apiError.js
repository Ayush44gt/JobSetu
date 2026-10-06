export class ApiError extends Error {
    constructor(status, message) {
        super(message);
        this.status = status;
    }
}

// wraps an async controller so a rejected promise reaches the error middleware
export const catchAsync = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

export const escapeRegex = (text = "") => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
