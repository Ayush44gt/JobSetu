import express from "express";
import isAuthenticated, { authorize } from "../middlewares/isAuthenticated.js";
import { applyJob, getApplicants, getAppliedJobs, updateStatus, withdrawApplication } from "../controllers/application.controller.js";
 
const router = express.Router();

router.route("/apply/:id").post(isAuthenticated, authorize("student"), applyJob);
router.route("/get").get(isAuthenticated, authorize("student"), getAppliedJobs);
router.route("/withdraw/:id").delete(isAuthenticated, authorize("student"), withdrawApplication);
router.route("/:id/applicants").get(isAuthenticated, authorize("recruiter"), getApplicants);
router.route("/status/:id/update").post(isAuthenticated, authorize("recruiter"), updateStatus);

export default router;
