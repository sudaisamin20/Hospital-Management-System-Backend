import mongoose from "mongoose";

const departmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
  },
  { timestamps: true },
);

const DepartmentModel = mongoose.model("Department", departmentSchema);

export default DepartmentModel;
