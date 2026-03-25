import mongoose from "mongoose";
import UserModel from "./userModel.ts";

export interface IPatient extends mongoose.Document {
  fullName: string;
  email: string;
  password: string;
  phoneNo: string;
  role: "patient";
  dob: string;
  gender: string;
  address: string;
  emergencyNo: string;
  agreeTerms: boolean;
  isActive: boolean;
  bloodGroup?: string;
  allergies?: string[];
  photo: string;
  createdAt: Date;
  updatedAt: Date;
}

const PatientSchema = new mongoose.Schema<IPatient>({
  dob: { type: String, required: true },
  gender: { type: String, required: true },
  address: { type: String, required: true },
  emergencyNo: { type: String, required: true },
  agreeTerms: { type: Boolean, required: true },
  bloodGroup: { type: String, default: null },
  allergies: { type: [String], default: [] },
  photo: { type: String },
});

const PatientModel = UserModel.discriminator<IPatient>(
  "patient",
  PatientSchema,
);

export default PatientModel;
