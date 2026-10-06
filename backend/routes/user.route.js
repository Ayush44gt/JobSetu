import express from "express";
import { getMe, getSavedJobs, login, logout, openResume, register, toggleSavedJob, updateProfile } from "../controllers/user.controller.js";
import isAuthenticated, { authorize } from "../middlewares/isAuthenticated.js";
import { profileUpload, singleUpload } from "../middlewares/multer.js";
 
const router = express.Router();

router.route("/register").post(singleUpload,register);
router.route("/login").post(login);
router.route("/logout").get(logout);
router.route("/me").get(isAuthenticated,getMe);
router.route("/profile/update").post(isAuthenticated,profileUpload,updateProfile);
router.route("/resume/:id").get(isAuthenticated,openResume);
router.route("/saved").get(isAuthenticated,authorize("student"),getSavedJobs);
router.route("/saved/:id").post(isAuthenticated,authorize("student"),toggleSavedJob);

export default router;
