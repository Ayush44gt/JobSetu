import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    fullname: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    phoneNumber: {
        type: String,
        required: true,
        trim: true
    },
    password:{
        type:String,
        required:true,
    },
    role:{
        type:String,
        enum:['student','recruiter'],
        required:true
    },
    profile:{
        bio:{type:String, default:""},
        skills:[{type:String}],
        resume:{type:String, default:""}, // URL to resume file
        resumeOriginalName:{type:String, default:""},
        company:{type:mongoose.Schema.Types.ObjectId, ref:'Company'}, 
        profilePhoto:{
            type:String,
            default:""
        }
    },
    savedJobs:[{type:mongoose.Schema.Types.ObjectId, ref:'Job'}],
},{timestamps:true});
export const User = mongoose.model('User', userSchema);
