import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

const readUser = async (req) => {
    const token = req.cookies?.token;
    if (!token) return null;
    try {
        const decode = jwt.verify(token, process.env.SECRET_KEY);
        return await User.findById(decode.userId).select("_id role");
    } catch (error) {
        return null;
    }
}

const isAuthenticated = async (req, res, next) => {
    try {
        const user = await readUser(req);
        if (!user) {
            return res.status(401).json({
                message: "Please login to continue.",
                success: false,
            })
        }
        req.id = user._id.toString();
        req.role = user.role;
        next();
    } catch (error) {
        next(error);
    }
}

// attaches the user when a valid cookie is present, but never blocks the request
export const optionalAuth = async (req, res, next) => {
    try {
        const user = await readUser(req);
        if (user) {
            req.id = user._id.toString();
            req.role = user.role;
        }
        next();
    } catch (error) {
        next(error);
    }
}

export const authorize = (...roles) => (req, res, next) => {
    if (!roles.includes(req.role)) {
        return res.status(403).json({
            message: `Only ${roles.join(" or ")} accounts can do this.`,
            success: false
        })
    }
    next();
}

export default isAuthenticated;
