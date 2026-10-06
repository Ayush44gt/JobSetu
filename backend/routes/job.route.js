import express from "express";
import isAuthenticated, { authorize, optionalAuth } from "../middlewares/isAuthenticated.js";
import { deleteJob, getAdminJobs, getAllJobs, getJobById, getJobMeta, postJob, toggleJobStatus, updateJob } from "../controllers/job.controller.js";

const router = express.Router();
const recruiter = [isAuthenticated, authorize("recruiter")];

router.route("/post").post(recruiter, postJob);
router.route("/get").get(getAllJobs);
router.route("/meta").get(getJobMeta);
router.route("/getadminjobs").get(recruiter, getAdminJobs);
router.route("/get/:id").get(optionalAuth, getJobById);
router.route("/update/:id").put(recruiter, updateJob);
router.route("/status/:id").patch(recruiter, toggleJobStatus);
router.route("/delete/:id").delete(recruiter, deleteJob);

export default router;
