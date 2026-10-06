import { Company } from "../models/company.model.js";
import { Job } from "../models/job.model.js";
import { Application } from "../models/application.model.js";
import { uploadFile } from "../utils/cloudinary.js";
import { ApiError, catchAsync, escapeRegex } from "../utils/apiError.js";

const findOwnedCompany = async (companyId, userId) => {
    const company = await Company.findById(companyId);
    if (!company) throw new ApiError(404, "Company not found.");
    if (company.userId.toString() !== userId) throw new ApiError(403, "You can only manage your own companies.");
    return company;
}

const findByName = (name, excludeId) => Company.findOne({
    name: { $regex: `^${escapeRegex(name)}$`, $options: "i" },
    ...(excludeId ? { _id: { $ne: excludeId } } : {})
});

export const registerCompany = catchAsync(async (req, res) => {
    const companyName = req.body.companyName?.trim();
    if (!companyName) throw new ApiError(400, "Company name is required.");
    if (await findByName(companyName)) throw new ApiError(409, "A company with this name is already registered.");

    const company = await Company.create({
        name: companyName,
        userId: req.id
    });

    return res.status(201).json({
        message: "Company registered successfully.",
        company,
        success: true
    })
});

// companies owned by the logged in recruiter, with how many jobs each has
export const getCompany = catchAsync(async (req, res) => {
    const companies = await Company.find({ userId: req.id }).sort({ createdAt: -1 }).lean();
    const counts = await Job.aggregate([
        { $match: { company: { $in: companies.map((company) => company._id) } } },
        { $group: { _id: "$company", total: { $sum: 1 } } }
    ]);
    const countMap = Object.fromEntries(counts.map((c) => [c._id.toString(), c.total]));
    return res.status(200).json({
        companies: companies.map((company) => ({ ...company, jobsCount: countMap[company._id.toString()] || 0 })),
        success:true
    })
});

// get company by id
export const getCompanyById = catchAsync(async (req, res) => {
    const company = await Company.findById(req.params.id);
    if (!company) throw new ApiError(404, "Company not found.");
    return res.status(200).json({
        company,
        success: true
    })
});

export const updateCompany = catchAsync(async (req, res) => {
    const company = await findOwnedCompany(req.params.id, req.id);
    const { description, website, location } = req.body;
    const name = req.body.name?.trim();

    if (req.body.name !== undefined) {
        if (!name) throw new ApiError(400, "Company name cannot be empty.");
        if (await findByName(name, company._id)) throw new ApiError(409, "A company with this name is already registered.");
        company.name = name;
    }
    if (description !== undefined) company.description = description.trim();
    if (website !== undefined) company.website = website.trim();
    if (location !== undefined) company.location = location.trim();
    // logo is optional
    if (req.file) company.logo = await uploadFile(req.file, "logos");

    await company.save();

    return res.status(200).json({
        message:"Company information updated.",
        company,
        success:true
    })
});

// removes the company together with its jobs and their applications
export const deleteCompany = catchAsync(async (req, res) => {
    const company = await findOwnedCompany(req.params.id, req.id);
    const jobs = await Job.find({ company: company._id }).select("_id");
    const jobIds = jobs.map((job) => job._id);
    await Application.deleteMany({ job: { $in: jobIds } });
    await Job.deleteMany({ _id: { $in: jobIds } });
    await company.deleteOne();

    return res.status(200).json({
        message: "Company deleted.",
        success: true
    });
});
