import express from "express";
import { createConsultationController } from "../controllers/consultationController.ts";

const router = express.Router();

router.post("/create-consultation", createConsultationController);

export default router;
