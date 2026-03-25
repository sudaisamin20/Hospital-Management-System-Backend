import mongoose from "mongoose";
import LabDepartmentModel from "../models/labDepartments.ts";

const labDepartments = [
  {
    name: "Pathology Lab",
    description:
      "General laboratory for blood tests, urine tests, and routine diagnostics.",
  },
  {
    name: "Hematology Lab",
    description: "Performs blood-related tests like CBC, ESR, blood grouping.",
  },
  {
    name: "Biochemistry Lab",
    description:
      "Performs sugar tests, LFT, RFT, lipid profile, and other chemical tests.",
  },
  {
    name: "Microbiology Lab",
    description:
      "Handles cultures, infection detection, and sensitivity testing.",
  },
  {
    name: "Radiology Department",
    description: "Performs X-ray, Ultrasound, and basic imaging services.",
  },
  {
    name: "Ultrasound Unit",
    description:
      "Performs abdominal, pelvic, pregnancy and soft tissue ultrasounds.",
  },
  {
    name: "X-Ray Unit",
    description: "Performs digital and conventional X-ray imaging.",
  },
  {
    name: "ECG / Cardiology Lab",
    description: "Performs ECG tests and basic heart monitoring diagnostics.",
  },
  {
    name: "COVID / PCR Lab",
    description: "Performs PCR and viral testing.",
  },
];

const MDBURI =
  process.env.MONGODB_URI ||
  "mongodb://127.0.0.1:27017/hospital_management_system";

export const seedLabDepartments = async () => {
  try {
    await mongoose.connect(MDBURI);

    console.log("Seeding Lab Departments...");

    for (const dep of labDepartments) {
      const existing = await LabDepartmentModel.findOne({ name: dep.name });
      if (existing) {
        console.log(`${dep.name} already exists`);
        continue;
      }
      await LabDepartmentModel.create(dep);
    }

    console.log("Lab Departments Seeded Successfully!");
  } catch (error) {
    console.error("Seeding Error:", error);
  }
};

await seedLabDepartments();
