import express from "express";
import {
  addAppointmentController,
  approveResReqController,
  cancelAppointmentController,
  completeAptStatusController,
  confirmAptStatusController,
  deleteAptController,
  fetchPatientAllAptsController,
  getAllAppointmentsController,
  getAllPatientNotificationsController,
  getAllUnreadCountsController,
  getDoctorAppointmentsController,
  getResReqsAptsController,
  markAsSeenAppointmentsController,
  requestrescheduleController,
  rescheduleAptDateController,
  setStartedAptTimeController,
} from "../controllers/appointmentController.ts";
import { requiredAuthMiddleware } from "../middlewares/requiredTokenMiddleware.ts";

const router = express.Router();

// Patient Routes
router.post("/add-appointment", addAppointmentController);
router.get(
  "/fetch/patient-all-appointments/:patientId",
  fetchPatientAllAptsController,
);
router.put("/cancel-appointment", cancelAppointmentController);
router.get(
  "/fetch/notifications/:patientId",
  getAllPatientNotificationsController,
);

// Receptionist Routes
router.get("/fetch/all-appointments/:recId", getAllAppointmentsController);
router.put("/reschedule-appointment", rescheduleAptDateController);
router.put("/confirm-apt-status", confirmAptStatusController);
router.put("/complete-apt-status", completeAptStatusController);
router.put("/delete-apt", deleteAptController);
router.put("/approve-reschedule", approveResReqController);

// Doctor Routes
router.get("/fetch/doctor-appointments/:id", getDoctorAppointmentsController);
router.put("/request-reschedule", requestrescheduleController);
router.get("/fetch/reschedule-requests", getResReqsAptsController);
router.put(
  "/set-start-time",
  requiredAuthMiddleware,
  setStartedAptTimeController,
);

// Controlled by many
router.get(
  "/fetch/unread-count",
  requiredAuthMiddleware,
  getAllUnreadCountsController,
);
router.put(
  "/mark-as-seen",
  requiredAuthMiddleware,
  markAsSeenAppointmentsController,
);

export default router;
