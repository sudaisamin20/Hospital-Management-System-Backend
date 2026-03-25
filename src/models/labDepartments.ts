import mongoose from "mongoose";

const labDepartmentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const LabDepartmentModel = mongoose.model("LabDepartment", labDepartmentSchema);

export default LabDepartmentModel;
