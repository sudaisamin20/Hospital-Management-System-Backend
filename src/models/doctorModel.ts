import mongoose from "mongoose";
import UserModel from "./userModel.ts";

export interface IDoctor extends mongoose.Document {
  id_no: string;
  fullName: string;
  email: string;
  password: string;
  phoneNo: string;
  role: string;
  licenseNo: string;
  specialization: string;
  // departmentId: string;
  yearsOfExperience: string;
  qualification: string;
  salary: string;
  photo: string;
  doj: string;
  dob: string;
  maritalStatus: string;
  // specialistId: string;
  emergencyNo: string;
  address: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const DoctorSchema = new mongoose.Schema<IDoctor>({
  licenseNo: { type: String, required: true },
  specialization: { type: String, required: true },
  departmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Department",
    required: true,
  },
  yearsOfExperience: { type: String, required: true },
  qualification: { type: String, required: true },
  doj: { type: String, required: true },
  dob: { type: String, required: true },
  maritalStatus: { type: String, required: true },
  specialistId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Specialist",
    required: true,
  },
  salary: { type: String, required: true },
  photo: { type: String, required: true },
  emergencyNo: { type: String, required: true },
  address: { type: String, required: true },
});

const DoctorModel = UserModel.discriminator<IDoctor>("doctor", DoctorSchema);

export default DoctorModel;
