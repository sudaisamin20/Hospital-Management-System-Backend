import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema({
  id_no: { type: String, required: true, unique: true },
  aptDate: { type: String, required: true },
  departmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Department",
    required: true,
  },
  specialistId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Specialist",
    required: true,
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "doctor",
    required: true,
  },
  shift: { type: String, required: true },
  appointmentTime: { type: String, required: true },
  reasonForVisit: { type: String, required: true },
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "patient",
    required: true,
  },
  status: {
    type: String,
    enum: [
      "Pending",
      "Confirmed",
      "Completed",
      "Cancelled",
      "Reschedule Requested",
      "Rescheduled",
    ],
    default: "Pending",
  },
  handleBy: { type: mongoose.Schema.Types.ObjectId, ref: "receptionist" },
  confirmedAt: { type: Date },
  completedAt: { type: Date },
  cancelledAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
  hiddenFor: [
    {
      role: {
        type: String,
        enum: ["patient", "receptionist"],
      },
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      hiddenAt: { type: Date, default: Date.now },
    },
  ],
  addDetails: { type: String },
  rescheduleReason: { type: String },
  rescheduleStatus: {
    type: String,
    enum: ["Pending", "Approved", "Rejected"],
    default: null,
  },
  oldShiftApt: {
    type: String,
  },
  oldAptTime: {
    type: String,
  },
  oldAptDate: {
    type: Date,
  },
  suggestedSlots: [
    {
      date: {
        type: Date,
      },
      shift: {
        type: String,
        enum: ["morning", "evening"],
      },
      time: {
        type: String,
      },
    },
  ],
  rescheduleRequestedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "doctor",
  },
  rescheduleRequestedAt: { type: Date },
  rescheduledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "receptionist",
  },
  rescheduledAt: { type: Date },
});

const AppointmentModel = mongoose.model("Appointments", appointmentSchema);

export default AppointmentModel;
