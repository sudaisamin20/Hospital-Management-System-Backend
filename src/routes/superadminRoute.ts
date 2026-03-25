import express from "express";
import {
  fetchDepartmentsController,
  fetchLabAssDepts,
  fetchSpecialistsController,
  fetchStaffDataController,
  loginSuperAdminController,
  updateStaffMemberProfileController,
} from "../controllers/superAdminController.ts";
import upload from "../middlewares/multerMiddleware.ts";
import { requiredAuthMiddleware } from "../middlewares/requiredTokenMiddleware.ts";

const router = express.Router();

router.post("/auth/login", loginSuperAdminController);
router.get("/fetch/staff-data", fetchStaffDataController);
router.put(
  "/update/staff-member-profile/:id",
  upload.single("photo"),
  updateStaffMemberProfileController,
);
router.get("/fetch/departments", fetchDepartmentsController);
router.get("/fetch/specialists/:id", fetchSpecialistsController);
router.get("/fetch/lab/departments", requiredAuthMiddleware, fetchLabAssDepts);

export default router;
