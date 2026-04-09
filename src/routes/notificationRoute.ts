import express from "express";
import { requiredAuthMiddleware } from "../middlewares/requiredTokenMiddleware.ts";
import {
  deleteNotificationController,
  getNotificationsController,
  markALLAsReadNotificationController,
  markAsReadNotificationController,
  markAsSeenNotificationsController,
} from "../controllers/NotificationController.ts";

const router = express.Router();

router.get("/fetch", requiredAuthMiddleware, getNotificationsController);
router.put(
  "/mark-all-as-read",
  requiredAuthMiddleware,
  markALLAsReadNotificationController,
);
router.put(
  "/mark-as-read/:notificationId",
  requiredAuthMiddleware,
  markAsReadNotificationController,
);
router.delete(
  "/delete/:notificationId",
  requiredAuthMiddleware,
  deleteNotificationController,
);

router.put(
  "/mark-as-seen",
  requiredAuthMiddleware,
  markAsSeenNotificationsController,
);

export default router;
