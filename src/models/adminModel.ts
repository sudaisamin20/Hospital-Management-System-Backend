import mongoose from "mongoose";
import UserModel from "./userModel.ts";

export interface IAdmin extends mongoose.Document {
  fullName: string;
  email: string;
  password: string;
  phoneNo: string;
  role: "admin";
  department: string;
  createdBy?: mongoose.Types.ObjectId; // SuperAdmin who created this admin
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AdminSchema = new mongoose.Schema<IAdmin>({
  department: { type: String, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

const AdminModel = UserModel.discriminator<IAdmin>("admin", AdminSchema);

export default AdminModel;
