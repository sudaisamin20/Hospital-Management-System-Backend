import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },
  title: String,
  message: String,
  aptId: { type: mongoose.Schema.Types.ObjectId, ref: "Appointments" },
  isRead: {
    type: Boolean,
    default: false,
  },
  // Lab Test Details
  labOrder: {
    labOrderId: mongoose.Schema.Types.ObjectId,
    testName: String,
    testId: String,
    status: String,
    results: mongoose.Schema.Types.Mixed,
    remarks: String,
    resultPDF: String,
    completedAt: Date,
  },
  // Prescription Details
  prescription: {
    prescriptionId: String,
    status: String,
    medicines: [
      {
        medicineName: String,
        dosage: Number,
        frequency: Number,
        duration: Number,
        unit: String,
        note: String,
      },
    ],
    totalAmount: Number,
    resultPDF: String,
    dispensedAt: Date,
  },
  // Notification type: appointment, lab, prescription, etc
  notificationType: {
    type: String,
    enum: [
      "appointment",
      "lab",
      "prescription",
      "general",
      "appointment_confirmed",
      "appointment_cancelled",
      "appointment_completed",
      "lab_test",
    ],
    default: "general",
  },
  seenBy: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const NotificationModel = mongoose.model("Notification", notificationSchema);

export default NotificationModel;
