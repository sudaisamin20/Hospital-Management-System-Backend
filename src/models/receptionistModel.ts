import mongoose from "mongoose";
import UserModel from "./userModel.ts";

export interface IReceptionist extends mongoose.Document {
  id_no: string;
  fullName: string;
  email: string;
  password: string;
  phoneNo: string;
  role: string;
  dob: string;
  maritalStatus: string;
  qualification: string;
  yearsOfExperience: string;
  doj: string;
  emergencyNo: string;
  salary: string;
  photo: string;
  address: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ReceptionistSchema = new mongoose.Schema<IReceptionist>({
  id_no: { type: String },
  dob: { type: String, required: true },
  maritalStatus: { type: String, required: true },
  qualification: { type: String, required: true },
  yearsOfExperience: { type: String, required: true },
  doj: { type: String, required: true },
  photo: { type: String, requied: true },
  salary: { type: String, requied: true },
  address: { type: String, requied: true },
  emergencyNo: { type: String, required: true },
});

const ReceptionistModel = UserModel.discriminator<IReceptionist>(
  "receptionist",
  ReceptionistSchema,
);

export default ReceptionistModel;
