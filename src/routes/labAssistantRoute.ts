import express from "express";
import {
  deleteLabOrderController,
  fetchLabOrdersByDepartment,
  fetchPatientAllTestReportsController,
  loginLabAssistantController,
  markAsSeenLabOrdersController,
  registerLabAssistantController,
  searchLabtestSuggestionsController,
  startTestController,
  submitTestResultController,
} from "../controllers/labAssistantController.ts";
import upload from "../middlewares/multerMiddleware.ts";
import { requiredAuthMiddleware } from "../middlewares/requiredTokenMiddleware.ts";

const router = express.Router();

router.post(
  "/auth/register/lab-assistant",
  upload.single("photo"),
  registerLabAssistantController,
);
router.post("/auth/login", loginLabAssistantController);
router.get(
  "/fetch/all-tests/:departmentId",
  requiredAuthMiddleware,
  fetchLabOrdersByDepartment,
);
router.get("/search", searchLabtestSuggestionsController);
router.put("/start-test", requiredAuthMiddleware, startTestController);
router.put(
  "/submit-result",
  requiredAuthMiddleware,
  submitTestResultController,
);
router.get(
  "/patient/reports",
  requiredAuthMiddleware,
  fetchPatientAllTestReportsController,
);
router.put(
  "/delete-lab-order",
  requiredAuthMiddleware,
  deleteLabOrderController,
);
router.put(
  "/mark-as-seen",
  requiredAuthMiddleware,
  markAsSeenLabOrdersController,
);

export default router;
