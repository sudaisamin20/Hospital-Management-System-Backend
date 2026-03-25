import mongoose from "mongoose";

const testSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    departmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LabDepartment",
      required: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    sampleType: {
      type: String,
      enum: ["Blood", "Urine", "Stool", "Imaging", "Cardiac", "Other"],
      default: "Other",
    },

    description: {
      type: String,
    },

    normalRange: {
      type: String, // e.g. "4.5 - 11 x10^9/L"
    },

    reportType: {
      type: String,
      enum: ["Numeric", "Text", "File"],
      default: "Numeric",
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

const TestModel = mongoose.model("Test", testSchema);

export default TestModel;
