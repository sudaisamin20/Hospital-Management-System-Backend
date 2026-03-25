import mongoose from "mongoose";

export interface IUser {
  id_no: string;
  fullName: string;
  email: string;
  password: string;
  phoneNo: string;
  role:
    | "superadmin"
    | "admin"
    | "doctor"
    | "receptionist"
    | "patient"
    | "pharmacy"
    | "laboratory";
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new mongoose.Schema<IUser>(
  {
    id_no: { type: String, unique: true },
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phoneNo: { type: String, required: true },
    role: {
      type: String,
      enum: [
        "superadmin",
        "admin",
        "doctor",
        "receptionist",
        "patient",
        "pharmacist",
        "labAssistant",
      ],
      required: true,
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true, discriminatorKey: "role" },
);

const UserModel = mongoose.model<IUser>("User", UserSchema);

export default UserModel;
