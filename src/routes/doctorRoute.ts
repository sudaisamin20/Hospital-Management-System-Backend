import express from "express";
import {
  getDoctorDashboardDataController,
  getDoctorLabTestReportsController,
  getDoctorPatientDetailsController,
  getDoctorPatientProfileDetailsController,
  getDoctorPrescriptionsController,
  getDoctorProfileDetailsController,
  loginDoctorController,
  registerDoctorController,
  updateDoctorProfileController,
} from "../controllers/doctorController.ts";
import upload from "../middlewares/multerMiddleware.ts";
import { requiredAuthMiddleware } from "../middlewares/requiredTokenMiddleware.ts";

const router = express.Router();

router.post("/auth/register", upload.single("photo"), registerDoctorController);
router.post("/auth/login", loginDoctorController);
router.get(
  "/get-dashboard-data",
  requiredAuthMiddleware,
  getDoctorDashboardDataController,
);
router.get(
  "/get-patients-data",
  requiredAuthMiddleware,
  getDoctorPatientDetailsController,
);
router.get(
  "/patients/:patientId/profile",
  requiredAuthMiddleware,
  getDoctorPatientProfileDetailsController,
);
router.get(
  "/fetch/prescriptions",
  requiredAuthMiddleware,
  getDoctorPrescriptionsController,
);
router.get(
  "/fetch/lab-tests",
  requiredAuthMiddleware,
  getDoctorLabTestReportsController,
);
router.get(
  "/profile-details",
  requiredAuthMiddleware,
  getDoctorProfileDetailsController,
);
router.put(
  "/update-profile",
  requiredAuthMiddleware,
  upload.single("photo"),
  updateDoctorProfileController,
);

export default router;
