import mongoose from "mongoose";
import dotenv from "dotenv";

import { seedSuperAdmin } from "./createSuperAdmin.ts";
import { seedDepartments } from "./seedDepartments.ts";

dotenv.config();

const MDBURI =
  process.env.MONGODB_URI ||
  "mongodb://127.0.0.1:27017/hospital_management_system";

const runSeeder = async () => {
  try {
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(MDBURI);

    console.log("MongoDB Connected");

    await seedSuperAdmin();
    await seedDepartments();

    console.log("All Seeds Completed Successfully!");

    process.exit();
  } catch (error) {
    console.error("Seeder Error:", error);
    process.exit(1);
  }
};

runSeeder();
