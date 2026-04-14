import express from "express";
import {
  loginReceptionistController,
  markAsSeenResReqAptsController,
  registerReceptionistController,
} from "../controllers/receptionistController.ts";
import upload from "../middlewares/multerMiddleware.ts";
import { requiredAuthMiddleware } from "../middlewares/requiredTokenMiddleware.ts";

const router = express.Router();

router.post(
  "/auth/register",
  upload.single("photo"),
  registerReceptionistController,
);
router.post("/auth/login", loginReceptionistController);
router.put(
  "/appointment/mark-as-seen/res-req-apts",
  requiredAuthMiddleware,
  markAsSeenResReqAptsController,
);

export default router;
