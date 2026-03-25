import mongoose from "mongoose";
import UserModel from "./userModel.ts";

export interface ISuperAdmin extends mongoose.Document {
  fullName: string;
  email: string;
  password: string;
  phoneNo: string;
  role: "superadmin";
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SuperAdminSchema = new mongoose.Schema<ISuperAdmin>({
  // SuperAdmin only has base fields from UserModel
  // No additional fields needed
});

const SuperAdminModel = UserModel.discriminator<ISuperAdmin>(
  "superadmin",
  SuperAdminSchema,
);

export default SuperAdminModel;
