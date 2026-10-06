import { Application } from "../models/application.model.js";
import { Job } from "../models/job.model.js";
import { ApiError, catchAsync } from "../utils/apiError.js";

export const applyJob = catchAsync(async (req, res) => {
    const userId = req.id;
    const jobId = req.params.id;

    // check if the jobs exists
    const job = await Job.findById(jobId);
    if (!job) throw new ApiError(404, "Job not found.");
    if (!job.isOpen) throw new ApiError(400, "This job is no longer accepting applications.");

    // check if the user has already applied for the job
    const existingApplication = await Application.findOne({ job: jobId, applicant: userId });
    if (existingApplication) throw new ApiError(400, "You have already applied for this job.");

    // create a new application
    const newApplication = await Application.create({
        job:jobId,
        applicant:userId,
    });

    await Job.updateOne({ _id: jobId }, { $addToSet: { applications: newApplication._id } });
    return res.status(201).json({
        message:"Job applied successfully.",
        application: newApplication,
        success:true
    })
});

export const getAppliedJobs = catchAsync(async (req,res) => {
    const application = await Application.find({applicant:req.id}).sort({createdAt:-1}).populate({
        path:'job',
        populate:{
            path:'company',
        }
    });
    return res.status(200).json({
        application,
        success:true
    })
});

// student withdraws an application that has not been reviewed yet
export const withdrawApplication = catchAsync(async (req, res) => {
    const application = await Application.findById(req.params.id);
    if (!application) throw new ApiError(404, "Application not found.");
    if (application.applicant.toString() !== req.id) throw new ApiError(403, "You can only withdraw your own applications.");
    if (application.status !== "pending") throw new ApiError(400, `This application was already ${application.status} and cannot be withdrawn.`);

    await Job.updateOne({ _id: application.job }, { $pull: { applications: application._id } });
    await application.deleteOne();
    return res.status(200).json({
        message: "Application withdrawn.",
        success: true
    });
});

// admin dekhega kitna user ne apply kiya hai
export const getApplicants = catchAsync(async (req,res) => {
    const job = await Job.findById(req.params.id)
        .populate({ path:'company' })
        .populate({
            path:'applications',
            options:{sort:{createdAt:-1}},
            populate:{
                path:'applicant',
                select:'-password -savedJobs'
            }
        });
    if (!job) throw new ApiError(404, "Job not found.");
    if (job.created_by.toString() !== req.id) throw new ApiError(403, "You can only view applicants for jobs you posted.");

    return res.status(200).json({
        job, 
        success:true
    });
});

export const updateStatus = catchAsync(async (req,res) => {
    const status = req.body.status?.toLowerCase();
    if (!status) throw new ApiError(400, "Status is required.");
    if (!['pending', 'accepted', 'rejected'].includes(status)) throw new ApiError(400, "Status must be pending, accepted or rejected.");

    // find the application by applicantion id
    const application = await Application.findById(req.params.id).populate({ path:'job', select:'created_by' });
    if (!application) throw new ApiError(404, "Application not found.");
    if (application.job?.created_by.toString() !== req.id) throw new ApiError(403, "You can only review applicants for jobs you posted.");

    // update the status
    application.status = status;
    await application.save();

    return res.status(200).json({
        message:`Application marked as ${status}.`,
        application: { _id: application._id, status: application.status },
        success:true
    });
});
