import mongoose from "mongoose";

const dispenseSchema = new mongoose.Schema(
  {
    prescriptionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Prescription",
      required: true,
    },

    pharmacistId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "pharmacist",
      required: true,
    },

    medicines: [
      {
        medicineId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Medicine",
        },
        quantity: {
          type: Number,
          required: true,
        },
        priceAtTime: {
          type: Number,
          required: true,
        },
      },
    ],

    totalAmount: {
      type: Number,
      required: true,
    },

    paymentMethod: {
      type: String,
      enum: ["Cash", "Card", "Online"],
      default: "Cash",
    },
  },
  { timestamps: true },
);

const DispenseModel = mongoose.model("Dispense", dispenseSchema);

export default DispenseModel;
