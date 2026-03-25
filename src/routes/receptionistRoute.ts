import express from "express";
import {
  loginReceptionistController,
  registerReceptionistController,
} from "../controllers/receptionistController.ts";
import upload from "../middlewares/multerMiddleware.ts";

const router = express.Router();

router.post(
  "/auth/register",
  upload.single("photo"),
  registerReceptionistController,
);
router.post("/auth/login", loginReceptionistController);

export default router;
