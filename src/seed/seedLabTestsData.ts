import mongoose from "mongoose";
import TestModel from "../models/testModel.ts";

export const testsSeed = [
  // ===============================
  // PATHOLOGY LAB
  // ===============================
  {
    name: "Urine Routine Examination (R/E)",
    departmentId: "69a6bd1f49205fe48834fc5a",
    price: 500,
    sampleType: "Urine",
    reportType: "Text",
  },
  {
    name: "Stool Routine Examination",
    departmentId: "69a6bd1f49205fe48834fc5a",
    price: 600,
    sampleType: "Stool",
    reportType: "Text",
  },
  {
    name: "Pregnancy Test (Urine hCG)",
    departmentId: "69a6bd1f49205fe48834fc5a",
    price: 800,
    sampleType: "Urine",
    reportType: "Numeric",
  },
  {
    name: "Dengue NS1 Antigen",
    departmentId: "69a6bd1f49205fe48834fc5a",
    price: 2500,
    sampleType: "Blood",
    reportType: "Numeric",
  },
  {
    name: "Typhidot Test",
    departmentId: "69a6bd1f49205fe48834fc5a",
    price: 2200,
    sampleType: "Blood",
    reportType: "Numeric",
  },

  // ===============================
  // HEMATOLOGY LAB
  // ===============================
  {
    name: "Complete Blood Count (CBC)",
    departmentId: "69a6bd1f49205fe48834fc5d",
    price: 1500,
    sampleType: "Blood",
    reportType: "Numeric",
    normalRange:
      "WBC: 4.5–11 x10^9/L | Hb: Male 13.5–17.5 g/dL, Female 12–15.5 g/dL | Platelets: 150–450 x10^9/L",
  },
  {
    name: "Erythrocyte Sedimentation Rate (ESR)",
    departmentId: "69a6bd1f49205fe48834fc5d",
    price: 700,
    sampleType: "Blood",
    reportType: "Numeric",
    normalRange: "Male: 0–15 mm/hr | Female: 0–20 mm/hr",
  },
  {
    name: "Platelet Count",
    departmentId: "69a6bd1f49205fe48834fc5d",
    price: 1000,
    sampleType: "Blood",
    reportType: "Numeric",
    normalRange: "150–450 x10^9/L",
  },
  {
    name: "Prothrombin Time (PT/INR)",
    departmentId: "69a6bd1f49205fe48834fc5d",
    price: 1800,
    sampleType: "Blood",
    reportType: "Numeric",
    normalRange: "PT: 11–13.5 sec | INR: 0.8–1.1",
  },
  {
    name: "Blood Group & Rh Factor",
    departmentId: "69a6bd1f49205fe48834fc5d",
    price: 900,
    sampleType: "Blood",
    reportType: "Text",
  },
  {
    name: "Activated Partial Thromboplastin Time (APTT)",
    departmentId: "69a6bd1f49205fe48834fc5d",
    price: 2000,
    sampleType: "Blood",
    reportType: "Numeric",
  },

  // ===============================
  // BIOCHEMISTRY LAB
  // ===============================
  {
    name: "Random Blood Sugar (RBS)",
    departmentId: "69a6bd1f49205fe48834fc60",
    price: 400,
    sampleType: "Blood",
    reportType: "Numeric",
  },
  {
    name: "Fasting Blood Sugar (FBS)",
    departmentId: "69a6bd1f49205fe48834fc60",
    price: 400,
    sampleType: "Blood",
    reportType: "Numeric",
  },
  {
    name: "Liver Function Test (LFT)",
    departmentId: "69a6bd1f49205fe48834fc60",
    price: 3500,
    sampleType: "Blood",
    reportType: "Numeric",
  },
  {
    name: "Renal Function Test (RFT)",
    departmentId: "69a6bd1f49205fe48834fc60",
    price: 3200,
    sampleType: "Blood",
    reportType: "Numeric",
  },
  {
    name: "Lipid Profile",
    departmentId: "69a6bd1f49205fe48834fc60",
    price: 3000,
    sampleType: "Blood",
    reportType: "Numeric",
  },
  {
    name: "Serum Uric Acid",
    departmentId: "69a6bd1f49205fe48834fc60",
    price: 1200,
    sampleType: "Blood",
    reportType: "Numeric",
  },
  {
    name: "Serum Creatinine",
    departmentId: "69a6bd1f49205fe48834fc60",
    price: 900,
    sampleType: "Blood",
    reportType: "Numeric",
  },
  {
    name: "Serum Electrolytes",
    departmentId: "69a6bd1f49205fe48834fc60",
    price: 2500,
    sampleType: "Blood",
    reportType: "Numeric",
  },

  // ===============================
  // MICROBIOLOGY LAB
  // ===============================
  {
    name: "Blood Culture & Sensitivity",
    departmentId: "69a6bd1f49205fe48834fc63",
    price: 4500,
    sampleType: "Blood",
    reportType: "Text",
  },
  {
    name: "Urine Culture & Sensitivity",
    departmentId: "69a6bd1f49205fe48834fc63",
    price: 3500,
    sampleType: "Urine",
    reportType: "Text",
  },
  {
    name: "Stool Culture",
    departmentId: "69a6bd1f49205fe48834fc63",
    price: 3200,
    sampleType: "Stool",
    reportType: "Text",
  },
  {
    name: "Hepatitis B (HBsAg)",
    departmentId: "69a6bd1f49205fe48834fc63",
    price: 2000,
    sampleType: "Blood",
    reportType: "Numeric",
  },
  {
    name: "Hepatitis C (Anti-HCV)",
    departmentId: "69a6bd1f49205fe48834fc63",
    price: 2200,
    sampleType: "Blood",
    reportType: "Numeric",
  },
  {
    name: "HIV Screening Test",
    departmentId: "69a6bd1f49205fe48834fc63",
    price: 2500,
    sampleType: "Blood",
    reportType: "Numeric",
  },

  // ===============================
  // RADIOLOGY DEPARTMENT
  // ===============================
  {
    name: "X-Ray Chest",
    departmentId: "69a6bd1f49205fe48834fc66",
    price: 1500,
    sampleType: "Imaging",
    reportType: "File",
  },
  {
    name: "X-Ray Hand",
    departmentId: "69a6bd1f49205fe48834fc66",
    price: 1200,
    sampleType: "Imaging",
    reportType: "File",
  },
  {
    name: "X-Ray Knee Joint",
    departmentId: "69a6bd1f49205fe48834fc66",
    price: 1500,
    sampleType: "Imaging",
    reportType: "File",
  },
  {
    name: "Ultrasound Abdomen",
    departmentId: "69a6bd1f49205fe48834fc66",
    price: 3500,
    sampleType: "Imaging",
    reportType: "Text",
  },
  {
    name: "Ultrasound Pelvis",
    departmentId: "69a6bd1f49205fe48834fc66",
    price: 3500,
    sampleType: "Imaging",
    reportType: "Text",
  },
  {
    name: "Obstetric Ultrasound (Pregnancy Scan)",
    departmentId: "69a6bd1f49205fe48834fc66",
    price: 4000,
    sampleType: "Imaging",
    reportType: "Text",
  },
];

const MDBURI =
  process.env.MONGODB_URI ||
  "mongodb://127.0.0.1:27017/hospital_management_system";

export const seedLabTestsData = async () => {
  try {
    await mongoose.connect(MDBURI);

    console.log("Seeding Lab Tests...");

    for (const test of testsSeed) {
      const existing = await TestModel.findOne({
        name: test.name,
        departmentId: test.departmentId,
        price: test.price,
        sampleType: test.sampleType,
        reportType: test.reportType,
      });
      if (existing) {
        console.log(`${test.name} already exists`);
        continue;
      }
      await TestModel.create(test);
    }

    console.log("Lab Tests Seeded Successfully!");
  } catch (error) {
    console.error("Seeding Error:", error);
  }
};

await seedLabTestsData();
