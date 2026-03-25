import bcrypt from "bcryptjs";
import UserModel from "../models/userModel.ts";

export const seedSuperAdmin = async () => {
  const exists = await UserModel.findOne({ role: "superadmin" });

  if (exists) {
    console.log("Superadmin already exists");
    return;
  }

  const hashed = await bcrypt.hash("SuperAdmin@123", 10);

  await UserModel.create({
    id_no: "SAD-38U26PE495",
    fullName: "Super Admin",
    email: "superadmin@hospital.com",
    password: hashed,
    phoneNo: "0000000000",
    role: "superadmin",
    isActive: true,
  });

  console.log("Superadmin created successfully!");
};
