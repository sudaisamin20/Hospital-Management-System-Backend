import mongoose from "mongoose";

const prescriptionSchema = new mongoose.Schema(
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

    medicines: [
      {
        medicineId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Medicine",
          required: true,
        },
        medicineName: String,
        dosage: Number,
        frequency: Number,
        duration: Number,
        quantity: Number,
        timing: String,
        instructions: String,
      },
    ],

    status: {
      type: String,
      enum: ["Pending", "Dispensed"],
      default: "Pending",
    },

    dispensedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "pharmacist",
    },

    dispensedAt: Date,
    hiddenFor: [
      {
        role: {
          type: String,
          enum: ["patient", "receptionist", "doctor"],
        },
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        hiddenAt: { type: Date, default: Date.now },
      },
    ],
    resultPDF: {
      type: String,
    },
  },

  { timestamps: true },
);

const PrescriptionModel = mongoose.model("Prescription", prescriptionSchema);

export default PrescriptionModel;
