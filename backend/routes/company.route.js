import express from "express";
import isAuthenticated, { authorize } from "../middlewares/isAuthenticated.js";
import { deleteCompany, getCompany, getCompanyById, registerCompany, updateCompany } from "../controllers/company.controller.js";
import { singleUpload } from "../middlewares/multer.js";

const router = express.Router();
const recruiter = [isAuthenticated, authorize("recruiter")];

router.route("/register").post(recruiter,registerCompany);
router.route("/get").get(recruiter,getCompany);
router.route("/get/:id").get(isAuthenticated,getCompanyById);
router.route("/update/:id").put(recruiter,singleUpload, updateCompany);
router.route("/delete/:id").delete(recruiter,deleteCompany);

export default router;
