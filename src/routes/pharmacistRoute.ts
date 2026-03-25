import express from "express";
import {
  loginPharmacistController,
  registerPharmacistController,
} from "../controllers/pharmacistController.ts";
import upload from "../middlewares/multerMiddleware.ts";

const router = express.Router();

router.post(
  "/auth/register",
  upload.single("photo"),
  registerPharmacistController,
);

router.post("/auth/login", loginPharmacistController);

export default router;
