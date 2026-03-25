import express from "express";
import {
  confirmDispensePrescriptionController,
  dispenseMedicineController,
  getAllPrescriptionsController,
  getDispenseHistoryController,
  getPatientAllPrescriptionsController,
  searchMedicineSuggestionsController,
} from "../controllers/prescriptionController.ts";
import { requiredAuthMiddleware } from "../middlewares/requiredTokenMiddleware.ts";

const router = express.Router();

router.get("/fetch-all", getAllPrescriptionsController);
router.put(
  "/confirmed-dispense/:prescriptionId",
  confirmDispensePrescriptionController,
);
router.get("/dispense-history/:pharmacistId", getDispenseHistoryController);
router.put("/dispense", requiredAuthMiddleware, dispenseMedicineController);
router.get("/search", searchMedicineSuggestionsController);
router.get(
  "/patient/fetch-all",
  requiredAuthMiddleware,
  getPatientAllPrescriptionsController,
);

export default router;
