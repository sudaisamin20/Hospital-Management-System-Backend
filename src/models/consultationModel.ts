import mongoose from "mongoose";

const consultationSchema = new mongoose.Schema(
  {
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

    vitals: {
      bloodPressure: { type: String },
      heartRate: { type: Number },
      temperature: { type: Number },
      weight: { type: Number },
      height: { type: Number },
    },

    symptoms: {
      type: String,
    },

    diagnosis: {
      type: String,
      required: true,
    },

    followUp: {
      duration: { type: String },
      notes: { type: String },
    },

    additionalNotes: {
      type: String,
    },
    resultPDF: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

const ConsultationModel = mongoose.model("Consultation", consultationSchema);

export default ConsultationModel;
