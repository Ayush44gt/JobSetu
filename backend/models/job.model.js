import mongoose from "mongoose";

export const JOB_TYPES = ["Full-time", "Part-time", "Internship", "Contract"];

const jobSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    requirements: [{
        type: String
    }],
    // annual package in LPA (lakhs per annum)
    salary: {
        type: Number,
        required: true,
        min: 0
    },
    // minimum experience in years
    experienceLevel:{
        type:Number,
        required:true,
        min: 0
    },
    location: {
        type: String,
        required: true,
        trim: true
    },
    jobType: {
        type: String,
        enum: JOB_TYPES,
        required: true
    },
    position: {
        type: Number,
        required: true,
        min: 1
    },
    isOpen: {
        type: Boolean,
        default: true
    },
    company: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required: true
    },
    created_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    applications: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Application',
        }
    ]
},{timestamps:true});
export const Job = mongoose.model("Job", jobSchema);
