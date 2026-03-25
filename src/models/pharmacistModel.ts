import UserModel from "./userModel.ts";
import mongoose from "mongoose";

export interface IPharmacist extends mongoose.Document {
  id_no: string;
  fullName: string;
  email: string;
  password: string;
  phoneNo: string;
  role: string;
  licenseNo: string;
  branch: string;
  qualification: string;
  yearsOfExperience: string;
  emergencyNo: string;
  salary: string;
  maritalStatus: string;
  doj: string;
  dob: string;
  address: string;
  photo: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PharmacistSchema = new mongoose.Schema<IPharmacist>({
  licenseNo: { type: String, required: true },
  branch: { type: String, required: true },
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

const PharmacistModel = UserModel.discriminator<IPharmacist>(
  "pharmacist",
  PharmacistSchema,
);

export default PharmacistModel;
