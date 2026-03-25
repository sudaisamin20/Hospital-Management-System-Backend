import express from "express";
import {
  changePasswordController,
  changeProfilePhotoController,
  deleteNotificationController,
  fetchRelatedDoctorsController,
  getPatientMedicalRecordController,
  getPatientProfileDetails,
  markALLAsReadNotificationController,
  markAsReadNotificationController,
  patientLoginController,
  patientRegisterController,
  updatePatientProfileController,
} from "../controllers/patientController.ts";
import { requiredAuthMiddleware } from "../middlewares/requiredTokenMiddleware.ts";
import upload from "../middlewares/multerMiddleware.ts";

const router = express.Router();

router.post("/auth/register", patientRegisterController);
router.post("/auth/login", patientLoginController);
router.get(
  "/fetch/related-doctors/:departmentId/:specialistId",
  fetchRelatedDoctorsController,
);
router.put(
  "/notification/mark-read/:notificationId",
  requiredAuthMiddleware,
  markAsReadNotificationController,
);
router.put(
  "/notification/mark-all-read",
  requiredAuthMiddleware,
  markALLAsReadNotificationController,
);
router.delete(
  "/notification/delete/:notificationId",
  requiredAuthMiddleware,
  deleteNotificationController,
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
