import UserModel from "./userModel.ts";
import mongoose from "mongoose";

export interface ILabAssistant extends mongoose.Document {
  id_no: string;
  fullName: string;
  email: string;
  password: string;
  phoneNo: string;
  role: string;
  departmentId?: string;
  isActive: boolean;
  qualification: string;
  yearsOfExperience: string;
  licenseNo?: string;
  emergencyNo: string;
  salary: string;
  maritalStatus: string;
  photo: string;
  doj: string;
  dob: string;
  address: string;
  createdAt: Date;
  updatedAt: Date;
}

const LabAssistantSchema = new mongoose.Schema<ILabAssistant>({
  departmentId: { type: String, required: true },
  licenseNo: { type: String },
  qualification: { type: String, required: true },
  yearsOfExperience: { type: String, required: true },
  emergencyNo: { type: String, required: true },
  salary: { type: String, required: true },
  maritalStatus: { type: String, required: true },
  doj: { type: String, required: true },
  dob: { type: String, required: true },
  address: { type: String, required: true },
  photo: { type: String, required: true },
});

const LabAssistantModel = UserModel.discriminator<ILabAssistant>(
  "labAssistant",
  LabAssistantSchema,
);

export default LabAssistantModel;
