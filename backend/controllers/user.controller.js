import { User } from "../models/user.model.js";
import { Job } from "../models/job.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { getResumeDownloadUrl, uploadFile } from "../utils/cloudinary.js";
import { ApiError, catchAsync } from "../utils/apiError.js";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[0-9+\-\s]{7,15}$/;

const cookieOptions = {
    maxAge: 1 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production'
};

const toPublicUser = (user) => ({
    _id: user._id,
    fullname: user.fullname,
    email: user.email,
    phoneNumber: user.phoneNumber,
    role: user.role,
    profile: user.profile,
    savedJobs: user.savedJobs,
    createdAt: user.createdAt
});

export const register = catchAsync(async (req, res) => {
    const { fullname, phoneNumber, password, role } = req.body;
    const email = req.body.email?.toLowerCase().trim();

    if (!fullname?.trim() || !email || !phoneNumber || !password || !role) {
        throw new ApiError(400, "Please fill in all the fields.");
    }
    if (!EMAIL_REGEX.test(email)) throw new ApiError(400, "Please enter a valid email address.");
    if (!PHONE_REGEX.test(phoneNumber)) throw new ApiError(400, "Please enter a valid phone number.");
    if (password.length < 6) throw new ApiError(400, "Password must be at least 6 characters.");
    if (!['student', 'recruiter'].includes(role)) throw new ApiError(400, "Please choose a valid role.");

    const existing = await User.findOne({ email });
    if (existing) throw new ApiError(409, "An account already exists with this email.");

    // profile photo is optional
    const profilePhoto = req.file ? await uploadFile(req.file, "avatars") : "";
    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
        fullname: fullname.trim(),
        email,
        phoneNumber,
        password: hashedPassword,
        role,
        profile:{ profilePhoto }
    });

    return res.status(201).json({
        message: "Account created successfully.",
        success: true
    });
});

export const login = catchAsync(async (req, res) => {
    const { password, role } = req.body;
    const email = req.body.email?.toLowerCase().trim();

    if (!email || !password || !role) {
        throw new ApiError(400, "Please enter your email, password and role.");
    }
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
        throw new ApiError(400, "Incorrect email or password.");
    }
    // check role is correct or not
    if (role !== user.role) {
        throw new ApiError(400, `This account is not registered as a ${role}.`);
    }

    const token = jwt.sign({ userId: user._id }, process.env.SECRET_KEY, { expiresIn: '1d' });

    return res.status(200).cookie("token", token, cookieOptions).json({
        message: `Welcome back ${user.fullname}`,
        user: toPublicUser(user),
        success: true
    })
});

export const logout = catchAsync(async (req, res) => {
    return res.status(200).cookie("token", "", { ...cookieOptions, maxAge: 0 }).json({
        message: "Logged out successfully.",
        success: true
    })
});

// used by the client to restore the session on page load
export const getMe = catchAsync(async (req, res) => {
    const user = await User.findById(req.id);
    if (!user) throw new ApiError(401, "Please login to continue.");
    return res.status(200).json({ user: toPublicUser(user), success: true });
});

export const updateProfile = catchAsync(async (req, res) => {
    const { fullname, phoneNumber, bio, skills } = req.body;
    const email = req.body.email?.toLowerCase().trim();

    const user = await User.findById(req.id);
    if (!user) throw new ApiError(404, "User not found.");

    if (fullname !== undefined) {
        if (!fullname.trim()) throw new ApiError(400, "Name cannot be empty.");
        user.fullname = fullname.trim();
    }
    if (email !== undefined && email !== user.email) {
        if (!EMAIL_REGEX.test(email)) throw new ApiError(400, "Please enter a valid email address.");
        const taken = await User.findOne({ email, _id: { $ne: user._id } });
        if (taken) throw new ApiError(409, "Another account already uses this email.");
        user.email = email;
    }
    if (phoneNumber !== undefined) {
        if (!PHONE_REGEX.test(phoneNumber)) throw new ApiError(400, "Please enter a valid phone number.");
        user.phoneNumber = phoneNumber;
    }
    if (bio !== undefined) user.profile.bio = bio.trim();
    if (skills !== undefined) {
        // drop blanks and repeats ("React" and "react" count as the same skill)
        const seen = new Set();
        user.profile.skills = skills.split(",").map((skill) => skill.trim()).filter((skill) => {
            if (!skill || seen.has(skill.toLowerCase())) return false;
            seen.add(skill.toLowerCase());
            return true;
        });
    }

    // resume and profile photo are both optional
    const resume = req.files?.file?.[0];
    const photo = req.files?.profilePhoto?.[0];
    if (resume) {
        user.profile.resume = await uploadFile(resume, "resumes");
        user.profile.resumeOriginalName = resume.originalname;
    }
    if (photo) {
        user.profile.profilePhoto = await uploadFile(photo, "avatars");
    }

    await user.save();

    return res.status(200).json({
        message:"Profile updated successfully.",
        user: toPublicUser(user),
        success:true
    })
});

// opens a resume: students can open their own, recruiters can open any applicant's
export const openResume = catchAsync(async (req, res) => {
    if (req.role !== "recruiter" && req.params.id !== req.id) {
        throw new ApiError(403, "You can only open your own resume.");
    }
    const user = await User.findById(req.params.id).select("profile.resume");
    if (!user?.profile?.resume) throw new ApiError(404, "No resume uploaded.");
    return res.redirect(getResumeDownloadUrl(user.profile.resume));
});

// student saves / unsaves a job
export const toggleSavedJob = catchAsync(async (req, res) => {
    const jobId = req.params.id;
    const job = await Job.findById(jobId).select("_id");
    if (!job) throw new ApiError(404, "Job not found.");

    const user = await User.findById(req.id);
    const alreadySaved = user.savedJobs.some((id) => id.toString() === jobId);
    if (alreadySaved) {
        user.savedJobs = user.savedJobs.filter((id) => id.toString() !== jobId);
    } else {
        user.savedJobs.push(jobId);
    }
    await user.save();

    return res.status(200).json({
        message: alreadySaved ? "Removed from saved jobs." : "Job saved for later.",
        saved: !alreadySaved,
        savedJobs: user.savedJobs,
        success: true
    });
});

export const getSavedJobs = catchAsync(async (req, res) => {
    const user = await User.findById(req.id).populate({
        path: "savedJobs",
        populate: { path: "company" }
    });
    // jobs deleted after being saved come back as null
    const jobs = (user?.savedJobs || []).filter(Boolean).reverse();
    return res.status(200).json({ jobs, success: true });
});
