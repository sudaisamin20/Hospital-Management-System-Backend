import express from "express";
import {
  changePasswordController,
  changeProfilePhotoController,
  fetchRelatedDoctorsController,
  getPatientMedicalRecordController,
  getPatientProfileDetails,
  patientLoginController,
  patientRegisterController,
  updatePatientProfileController,
} from "../controllers/patientController.ts";
import { requiredAuthMiddleware } from "../middlewares/requiredTokenMiddleware.ts";
import upload from "../middlewares/multerMiddleware.ts";
import { markALLAsReadNotificationController } from "../controllers/NotificationController.ts";

const router = express.Router();

router.post("/auth/register", patientRegisterController);
router.post("/auth/login", patientLoginController);
router.get(
  "/fetch/related-doctors/:departmentId/:specialistId",
  fetchRelatedDoctorsController,
);

router.put(
  "/notification/mark-all-read",
  requiredAuthMiddleware,
  markALLAsReadNotificationController,
);

router.get(
  "/medical-records",
  requiredAuthMiddleware,
  getPatientMedicalRecordController,
);

router.get(
  "/profile-details",
  requiredAuthMiddleware,
  getPatientProfileDetails,
);
router.put(
  "/update-profile",
  requiredAuthMiddleware,
  updatePatientProfileController,
);
router.put(
  "/change-password",
  requiredAuthMiddleware,
  changePasswordController,
);
router.put(
  "/change-photo",
  requiredAuthMiddleware,
  upload.single("photo"),
  changeProfilePhotoController,
);

export default router;
