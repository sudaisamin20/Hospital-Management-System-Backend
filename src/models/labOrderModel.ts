import mongoose from "mongoose";

const labOrderSchema = new mongoose.Schema(
  {
    id_no: String,
    consultationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Consultation",
      required: true,
    },

    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointments",
      required: true,
    },

    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "doctor",
      required: true,
    },

    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "patient",
      required: true,
    },
    tests: [
      {
        id_no: String,
        testName: String,
        testId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Test",
          required: true,
        },
        status: {
          type: String,
          enum: ["Pending", "In Progress", "Completed"],
          default: "Pending",
        },
        results: [
          {
            name: String,
            value: Number,
            range: String,
            unit: String,
            status: {
              type: String,
              enum: ["Normal", "High", "Low"],
            },
          },
        ],
        remarks: String,
        resultPDF: String,
        completedAt: Date,
      },
    ],
    hiddenFor: [
      {
        role: {
          type: String,
          enum: ["patient", "labAssistant"],
        },
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        hiddenAt: { type: Date, default: Date.now },
      },
    ],
    seenBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true },
);

const LabOrderModel = mongoose.model("labOrders", labOrderSchema);

export default LabOrderModel;
