import AppointmentModel from "../models/appointmentModel.ts";
import LabOrderModel from "../models/labOrderModel.ts";
import NotificationModel from "../models/notificationModel.ts";
import PrescriptionModel from "../models/prescriptionModel.ts";

export const getNotificationsController = async (req, res) => {
  try {
    const userId =
      req.user?.doctor?.id ||
      req.user?.patient?.id ||
      req.user?.receptionist?.id ||
      req.user?.user?.id;
    console.log(req.user);
    const notifications = await NotificationModel.find({
      userId,
    })
      .populate({
        path: "aptId",
        populate: [
          { path: "departmentId", select: "name" },
          { path: "specialistId", select: "name" },
          { path: "doctorId", select: "fullName photo id_no" },
          { path: "patientId", select: "fullName photo id_no email phoneNo" },
        ],
      })
      .sort({ createdAt: -1 });
    if (notifications.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No notification founded!" });
    }
    return res.status(200).json({
      success: true,
      message: "Doctor notifications fetched successfully!",
      notifications,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export const markALLAsReadNotificationController = async (req, res) => {
  try {
    const userId = req.user?.doctor?.id || req.user?.patient?.id;

    const result = await NotificationModel.updateMany(
      { userId, isRead: false },
      { isRead: true },
    );

    if (result.matchedCount === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No unread notifications found!" });
    }

    const updatedNots = await NotificationModel.find({ userId });

    return res.status(200).json({
      success: true,
      message: `${result.modifiedCount} notification(s) marked as read.`,
      notifications: updatedNots,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error,
    });
  }
};

export const markAsReadNotificationController = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const not = await NotificationModel.findById(notificationId);
    if (!not) {
      return res
        .status(404)
        .json({ success: false, message: "Notification not found!" });
    }
    not.isRead = true;
    await not.save();
    return res.status(200).json({
      success: true,
      message: "Notification marked as read.",
      notification: not,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error,
    });
  }
};

export const deleteNotificationController = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const not = await NotificationModel.findByIdAndDelete(notificationId);

    if (!not) {
      return res
        .status(404)
        .json({ success: false, message: "Notification not found!" });
    }

    return res
      .status(200)
      .json({ success: true, message: "Notification deleted successfully." });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error,
    });
  }
};

export const markAsSeenNotificationsController = async (req, res) => {
  try {
    const userId =
      req.user?.user?.id ||
      req.user?.labAssistant?.id ||
      req.user?.patient?.id ||
      req.user?.doctor?.id ||
      req.user?.pharmacist?.id;
    await NotificationModel.updateMany(
      {
        seenBy: { $ne: userId },
      },
      {
        $addToSet: { seenBy: userId },
      },
    );
    return res.status(200).json({
      success: true,
      message: "Notificaitons marked as viewed successfully!",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error,
    });
  }
};

export const getAllUnreadCountsController = async (req, res) => {
  try {
    const user =
      req.user?.user ||
      req.user?.receptionist ||
      req.user?.doctor ||
      req.user?.labAssistant ||
      req.user?.pharmacist ||
      req.user?.patient;
    const userId = user.id;
    const counts = {
      appointments: 0,
      labOrders: 0,
      prescriptions: 0,
      notifications: 0,
      resReqApts: 0,
    };

    if (user.role === "patient") {
      counts.notifications = await NotificationModel.countDocuments({
        userId,
        seenBy: { $ne: userId },
      });
      counts.appointments = await AppointmentModel.countDocuments({
        patientId: userId,
        seenBy: { $ne: userId },
        status: { $in: ["Confirmed", "Completed"] },
      });
      counts.labOrders = await LabOrderModel.countDocuments({
        seenBy: { $ne: userId },
        "tests.status": "Completed",
      });
      counts.prescriptions = await PrescriptionModel.countDocuments({
        seenBy: { $ne: userId },
        status: "Dispensed",
      });
    }

    if (user.role === "doctor") {
      counts.appointments = await AppointmentModel.countDocuments({
        doctorId: userId,
        seenBy: { $ne: userId },
        status: "Confirmed",
      });
      counts.notifications = await NotificationModel.countDocuments({
        userId,
        seenBy: { $ne: userId },
      });
    }

    if (user.role === "receptionist") {
      counts.appointments = await AppointmentModel.countDocuments({
        seenBy: { $ne: userId },
      });
      counts.resReqApts = await AppointmentModel.countDocuments({
        resReqSeen: false,
        handleBy: userId,
        rescheduleRequestedBy: { $exists: true, $ne: null },
      });
    }

    if (user.role === "labAssistant") {
      counts.labOrders = await LabOrderModel.countDocuments({
        seenBy: { $ne: userId },
        "tests.status": "Completed",
      });
    }

    if (user.role === "pharmacist") {
      counts.prescriptions = await PrescriptionModel.countDocuments({
        seenBy: { $ne: userId },
      });
    }

    res.status(200).json({
      success: true,
      counts,
    });
  } catch (err) {
    res.status(500).json({ success: false });
  }
};
