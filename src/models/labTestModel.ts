import mongoose from "mongoose";

export interface ILabTest extends mongoose.Document {
  prescriptionId: mongoose.Types.ObjectId;
  labId: mongoose.Types.ObjectId; // Which lab or lab technician
  testName: string;
  patientId: mongoose.Types.ObjectId;
  status: "Pending" | "Sample Taken" | "Tested" | "Result Uploaded";
  resultFile?: string; // file path or URL
  createdAt: Date;
  updatedAt: Date;
}

const LabTestSchema = new mongoose.Schema<ILabTest>(
  {
    prescriptionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Prescription",
      required: true,
    },
    labId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    testName: { type: String, required: true },
    status: {
      type: String,
      enum: [
        "Pending",
        "In Progress",
        "Sample Taken",
        "Tested",
        "Result Uploaded",
      ],
      default: "Pending",
    },
    resultFile: { type: String },
  },
  { timestamps: true },
);

const LabTestModel = mongoose.model<ILabTest>("LabTest", LabTestSchema);
export default LabTestModel;
