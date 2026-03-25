import mongoose from "mongoose";

const specialistSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    departmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: true,
    },
  },
  { timestamps: true },
);

const SpecialistModel = mongoose.model("Specialist", specialistSchema);
export default SpecialistModel;
