import express from "express";
import {
  addMedicineToInventoryController,
  deleteMedicineFromInventoryController,
  getInventoryMedicinesController,
  updateMedicineInfoController,
} from "../controllers/inventoryController.ts";
import { requiredAuthMiddleware } from "../middlewares/requiredTokenMiddleware.ts";

const router = express.Router();

router.get(
  "/fetch-all",
  requiredAuthMiddleware,
  getInventoryMedicinesController,
);
router.post(
  "/add-medicine",
  requiredAuthMiddleware,
  addMedicineToInventoryController,
);
router.put(
  "/update-medicine/:medicineId",
  requiredAuthMiddleware,
  updateMedicineInfoController,
);
router.delete(
  "/delete-medicine/:medicineId",
  requiredAuthMiddleware,
  deleteMedicineFromInventoryController,
);

export default router;
