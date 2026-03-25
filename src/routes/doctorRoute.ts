import express from "express";
import {
  loginDoctorController,
  registerDoctorController,
} from "../controllers/doctorController.ts";
import upload from "../middlewares/multerMiddleware.ts";

const router = express.Router();

router.post("/auth/register", upload.single("photo"), registerDoctorController);
router.post("/auth/login", loginDoctorController);

export default router;
