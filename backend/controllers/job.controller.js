import { Job, JOB_TYPES } from "../models/job.model.js";
import { Company } from "../models/company.model.js";
import { Application } from "../models/application.model.js";
import { User } from "../models/user.model.js";
import { ApiError, catchAsync, escapeRegex } from "../utils/apiError.js";

// validates the job form and returns clean values ready for the model
const readJobBody = (body) => {
    const { title, description, requirements, salary, location, jobType, experience, position } = body;

    if (!title?.trim() || !description?.trim() || !location?.trim() || !jobType) {
        throw new ApiError(400, "Please fill in all the fields.");
    }
    if (salary === undefined || salary === "" || experience === undefined || experience === "" || position === undefined || position === "") {
        throw new ApiError(400, "Please fill in all the fields.");
    }
    if (!JOB_TYPES.includes(jobType)) throw new ApiError(400, `Job type must be one of: ${JOB_TYPES.join(", ")}.`);

    const salaryNumber = Number(salary);
    const experienceNumber = Number(experience);
    const positionNumber = Number(position);
    if (Number.isNaN(salaryNumber) || salaryNumber < 0) throw new ApiError(400, "Salary must be a number (in LPA).");
    if (Number.isNaN(experienceNumber) || experienceNumber < 0) throw new ApiError(400, "Experience must be a number of years.");
    if (!Number.isInteger(positionNumber) || positionNumber < 1) throw new ApiError(400, "Number of positions must be at least 1.");

    const requirementList = (Array.isArray(requirements) ? requirements : String(requirements || "").split(","))
        .map((item) => item.trim())
        .filter(Boolean);

    return {
        title: title.trim(),
        description: description.trim(),
        requirements: requirementList,
        salary: salaryNumber,
        location: location.trim(),
        jobType,
        experienceLevel: experienceNumber,
        position: positionNumber
    };
}

const findOwnedJob = async (jobId, userId) => {
    const job = await Job.findById(jobId);
    if (!job) throw new ApiError(404, "Job not found.");
    if (job.created_by.toString() !== userId) throw new ApiError(403, "You can only manage jobs you posted.");
    return job;
}

const assertOwnsCompany = async (companyId, userId) => {
    if (!companyId) throw new ApiError(400, "Please select a company.");
    const company = await Company.findById(companyId);
    if (!company) throw new ApiError(404, "Company not found.");
    if (company.userId.toString() !== userId) throw new ApiError(403, "You can only post jobs for your own companies.");
}

// admin post krega job
export const postJob = catchAsync(async (req, res) => {
    const data = readJobBody(req.body);
    await assertOwnsCompany(req.body.companyId, req.id);

    const job = await Job.create({
        ...data,
        company: req.body.companyId,
        created_by: req.id
    });
    return res.status(201).json({
        message: "New job created successfully.",
        job,
        success: true
    });
});

export const updateJob = catchAsync(async (req, res) => {
    const job = await findOwnedJob(req.params.id, req.id);
    const data = readJobBody(req.body);
    if (req.body.companyId && req.body.companyId !== job.company.toString()) {
        await assertOwnsCompany(req.body.companyId, req.id);
        job.company = req.body.companyId;
    }
    Object.assign(job, data);
    if (req.body.isOpen !== undefined) job.isOpen = req.body.isOpen === true || req.body.isOpen === "true";
    await job.save();

    return res.status(200).json({
        message: "Job updated successfully.",
        job,
        success: true
    });
});

// open / close a job for new applications
export const toggleJobStatus = catchAsync(async (req, res) => {
    const job = await findOwnedJob(req.params.id, req.id);
    job.isOpen = !job.isOpen;
    await job.save();
    return res.status(200).json({
        message: job.isOpen ? "Job reopened for applications." : "Job closed for applications.",
        job,
        success: true
    });
});

export const deleteJob = catchAsync(async (req, res) => {
    const job = await findOwnedJob(req.params.id, req.id);
    await Application.deleteMany({ job: job._id });
    await User.updateMany({ savedJobs: job._id }, { $pull: { savedJobs: job._id } });
    await job.deleteOne();
    return res.status(200).json({
        message: "Job deleted.",
        success: true
    });
});

// student k liye
export const getAllJobs = catchAsync(async (req, res) => {
    const { keyword = "", location, jobType, salaryMin, salaryMax, experienceMax, sort } = req.query;
    const query = { isOpen: true };

    if (keyword.trim()) {
        const regex = { $regex: escapeRegex(keyword.trim()), $options: "i" };
        const companies = await Company.find({ name: regex }).select("_id");
        query.$or = [
            { title: regex },
            { description: regex },
            { location: regex },
            { requirements: regex },
            { company: { $in: companies.map((company) => company._id) } }
        ];
    }
    if (location) query.location = { $regex: escapeRegex(location), $options: "i" };
    if (jobType) query.jobType = { $in: String(jobType).split(",") };
    if (salaryMin || salaryMax) {
        query.salary = {};
        if (salaryMin && !Number.isNaN(Number(salaryMin))) query.salary.$gte = Number(salaryMin);
        if (salaryMax && !Number.isNaN(Number(salaryMax))) query.salary.$lte = Number(salaryMax);
    }
    if (experienceMax !== undefined && experienceMax !== "" && !Number.isNaN(Number(experienceMax))) {
        query.experienceLevel = { $lte: Number(experienceMax) };
    }

    const sortBy = sort === "salary" ? { salary: -1, createdAt: -1 } : { createdAt: -1 };
    const jobs = await Job.find(query).populate({
        path: "company"
    }).sort(sortBy).lean();

    return res.status(200).json({
        jobs: jobs.map(({ applications, ...job }) => ({ ...job, applicantsCount: applications?.length || 0 })),
        success: true
    })
});

// values the client needs to build its filters and landing page numbers
export const getJobMeta = catchAsync(async (req, res) => {
    const [locations, jobs, companies, students] = await Promise.all([
        Job.distinct("location", { isOpen: true }),
        Job.countDocuments({ isOpen: true }),
        Company.countDocuments(),
        User.countDocuments({ role: "student" })
    ]);
    return res.status(200).json({
        locations: locations.sort(),
        jobTypes: JOB_TYPES,
        stats: { jobs, companies, students },
        success: true
    });
});

// student
export const getJobById = catchAsync(async (req, res) => {
    const job = await Job.findById(req.params.id).populate({ path: "company" }).lean();
    if (!job) throw new ApiError(404, "Job not found.");

    let application = null;
    if (req.id) {
        application = await Application.findOne({ job: job._id, applicant: req.id }).select("status createdAt");
    }
    const { applications, ...rest } = job;
    return res.status(200).json({
        job: {
            ...rest,
            applicantsCount: applications?.length || 0,
            hasApplied: Boolean(application),
            applicationStatus: application?.status || null
        },
        success: true
    });
});

// admin kitne job create kra hai abhi tk
export const getAdminJobs = catchAsync(async (req, res) => {
    const jobs = await Job.find({ created_by: req.id })
        .populate({ path:'company' })
        .populate({ path:'applications', select:'status' })
        .sort({ createdAt: -1 })
        .lean();
    return res.status(200).json({
        jobs: jobs.map(({ applications = [], ...job }) => ({
            ...job,
            applicantsCount: applications.length,
            pendingCount: applications.filter((application) => application.status === "pending").length,
            acceptedCount: applications.filter((application) => application.status === "accepted").length,
            rejectedCount: applications.filter((application) => application.status === "rejected").length
        })),
        success: true
    })
});
