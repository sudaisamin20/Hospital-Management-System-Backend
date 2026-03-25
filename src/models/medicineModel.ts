import mongoose from "mongoose";

const medicineSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    genericName: {
      type: String,
    },

    brand: {
      type: String,
    },

    batchNumber: {
      type: String,
    },

    expiryDate: {
      type: Date,
      required: true,
    },

    price: {
      type: Number,
      required: true,
    },

    stockQuantity: {
      type: Number,
      required: true,
      default: 0,
    },

    description: {
      type: String,
    },

    tabletStrengthMg: {
      type: Number,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "pharmacist",
    },
  },
  { timestamps: true },
);

const MedicineModel = mongoose.model("Medicine", medicineSchema);

export default MedicineModel;
