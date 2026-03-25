import mongoose from "mongoose";
import MedicineModel from "../models/medicineModel.ts";

const medicineInventory = [
  // Pain Relief / Fever
  {
    name: "Panadol",
    genericName: "Paracetamol",
    brand: "GSK",
    batchNumber: "B1234",
    expiryDate: new Date("2027-06-30"),
    price: 20,
    stockQuantity: 200,
    description: "Pain relief and fever reducer",
    createdBy: "699f3e5f549f3cda69eac8bb",
  },
  {
    name: "Ibuprofen",
    genericName: "Ibuprofen",
    brand: "Abbott",
    batchNumber: "I2345",
    expiryDate: new Date("2026-08-31"),
    price: 25,
    stockQuantity: 180,
    description: "Pain relief, anti-inflammatory",
    createdBy: "699f3e5f549f3cda69eac8bb",
  },
  {
    name: "Diclofenac",
    genericName: "Diclofenac Sodium",
    brand: "Novartis",
    batchNumber: "D3456",
    expiryDate: new Date("2026-12-31"),
    price: 30,
    stockQuantity: 150,
    description: "Anti-inflammatory pain relief",
    createdBy: "699f3e5f549f3cda69eac8bb",
  },

  // Antibiotics
  {
    name: "Augmentin",
    genericName: "Amoxicillin/Clavulanic Acid",
    brand: "GSK",
    batchNumber: "A5678",
    expiryDate: new Date("2026-12-31"),
    price: 100,
    stockQuantity: 150,
    description: "Antibiotic for bacterial infections",
    createdBy: "699f3e5f549f3cda69eac8bb",
  },
  {
    name: "Ciprofloxacin",
    genericName: "Ciprofloxacin",
    brand: "Bayer",
    batchNumber: "C7890",
    expiryDate: new Date("2025-11-30"),
    price: 70,
    stockQuantity: 120,
    description: "Antibiotic for bacterial infections",
    createdBy: "699f3e5f549f3cda69eac8bb",
  },
  {
    name: "Azithromycin",
    genericName: "Azithromycin",
    brand: "Pfizer",
    batchNumber: "AZ1122",
    expiryDate: new Date("2026-10-31"),
    price: 80,
    stockQuantity: 100,
    description: "Antibiotic for respiratory infections",
    createdBy: "699f3e5f549f3cda69eac8bb",
  },
  {
    name: "Metronidazole",
    genericName: "Metronidazole",
    brand: "Sanofi",
    batchNumber: "M2233",
    expiryDate: new Date("2026-09-30"),
    price: 40,
    stockQuantity: 130,
    description: "Antibiotic for bacterial and protozoal infections",
    createdBy: "699f3e5f549f3cda69eac8bb",
  },

  // Cardiac / Blood Pressure
  {
    name: "Lipitor",
    genericName: "Atorvastatin",
    brand: "Pfizer",
    batchNumber: "L9012",
    expiryDate: new Date("2026-09-30"),
    price: 120,
    stockQuantity: 80,
    description: "Cholesterol lowering medicine",
    createdBy: "699f3e5f549f3cda69eac8bb",
  },
  {
    name: "Amlodipine",
    genericName: "Amlodipine",
    brand: "Cipla",
    batchNumber: "AM3344",
    expiryDate: new Date("2027-02-28"),
    price: 50,
    stockQuantity: 90,
    description: "Blood pressure control",
    createdBy: "699f3e5f549f3cda69eac8bb",
  },
  {
    name: "Captopril",
    genericName: "Captopril",
    brand: "Novartis",
    batchNumber: "CA5566",
    expiryDate: new Date("2026-11-30"),
    price: 45,
    stockQuantity: 100,
    description: "ACE inhibitor for hypertension",
    createdBy: "699f3e5f549f3cda69eac8bb",
  },

  // Diabetes
  {
    name: "Metformin",
    genericName: "Metformin",
    brand: "Novartis",
    batchNumber: "M1122",
    expiryDate: new Date("2027-01-31"),
    price: 40,
    stockQuantity: 160,
    description: "Oral medicine for type 2 diabetes",
    createdBy: "699f3e5f549f3cda69eac8bb",
  },
  {
    name: "Glimepiride",
    genericName: "Glimepiride",
    brand: "Sanofi",
    batchNumber: "G3344",
    expiryDate: new Date("2027-03-31"),
    price: 90,
    stockQuantity: 100,
    description: "Oral medicine for type 2 diabetes",
    createdBy: "699f3e5f549f3cda69eac8bb",
  },
  {
    name: "Insulin",
    genericName: "Insulin Human",
    brand: "Novo Nordisk",
    batchNumber: "I7788",
    expiryDate: new Date("2026-12-31"),
    price: 500,
    stockQuantity: 50,
    description: "Insulin injection for diabetes",
    createdBy: "699f3e5f549f3cda69eac8bb",
  },

  // Allergy / Respiratory
  {
    name: "Cetirizine",
    genericName: "Cetirizine",
    brand: "Pfizer",
    batchNumber: "CE3344",
    expiryDate: new Date("2027-04-30"),
    price: 15,
    stockQuantity: 200,
    description: "Allergy and antihistamine medicine",
    createdBy: "699f3e5f549f3cda69eac8bb",
  },
  {
    name: "Loratadine",
    genericName: "Loratadine",
    brand: "Cipla",
    batchNumber: "LO4455",
    expiryDate: new Date("2027-05-31"),
    price: 15,
    stockQuantity: 180,
    description: "Allergy and antihistamine medicine",
    createdBy: "699f3e5f549f3cda69eac8bb",
  },
  {
    name: "Salbutamol Inhaler",
    genericName: "Salbutamol",
    brand: "GSK",
    batchNumber: "S5566",
    expiryDate: new Date("2026-05-31"),
    price: 350,
    stockQuantity: 50,
    description: "Relieves asthma and bronchospasm",
    createdBy: "699f3e5f549f3cda69eac8bb",
  },
  {
    name: "Budesonide Inhaler",
    genericName: "Budesonide",
    brand: "AstraZeneca",
    batchNumber: "B6677",
    expiryDate: new Date("2026-12-31"),
    price: 450,
    stockQuantity: 40,
    description: "Asthma and COPD control",
    createdBy: "699f3e5f549f3cda69eac8bb",
  },

  // Vitamins / Supplements
  {
    name: "Vitamin C",
    genericName: "Ascorbic Acid",
    brand: "Cipla",
    batchNumber: "V1111",
    expiryDate: new Date("2027-08-31"),
    price: 20,
    stockQuantity: 200,
    description: "Boosts immunity",
    createdBy: "699f3e5f549f3cda69eac8bb",
  },
  {
    name: "Vitamin D3",
    genericName: "Cholecalciferol",
    brand: "Abbott",
    batchNumber: "V2222",
    expiryDate: new Date("2027-09-30"),
    price: 25,
    stockQuantity: 180,
    description: "Bone health supplement",
    createdBy: "699f3e5f549f3cda69eac8bb",
  },
  {
    name: "Calcium Carbonate",
    genericName: "Calcium Carbonate",
    brand: "Bayer",
    batchNumber: "C3333",
    expiryDate: new Date("2027-10-31"),
    price: 30,
    stockQuantity: 160,
    description: "Bone and teeth health supplement",
    createdBy: "699f3e5f549f3cda69eac8bb",
  },

  // Pain / Anti-inflammatory (Extra)
  {
    name: "Naproxen",
    genericName: "Naproxen",
    brand: "Novartis",
    batchNumber: "N4444",
    expiryDate: new Date("2026-09-30"),
    price: 35,
    stockQuantity: 120,
    description: "Pain and anti-inflammatory",
    createdBy: "699f3e5f549f3cda69eac8bb",
  },
  {
    name: "Tramadol",
    genericName: "Tramadol",
    brand: "Sanofi",
    batchNumber: "T5555",
    expiryDate: new Date("2026-11-30"),
    price: 60,
    stockQuantity: 100,
    description: "Moderate to severe pain relief",
    createdBy: "699f3e5f549f3cda69eac8bb",
  },

  // Cardiac / Blood
  {
    name: "Warfarin",
    genericName: "Warfarin",
    brand: "Bayer",
    batchNumber: "W6666",
    expiryDate: new Date("2026-08-31"),
    price: 70,
    stockQuantity: 90,
    description: "Blood thinner / anticoagulant",
    createdBy: "699f3e5f549f3cda69eac8bb",
  },
  {
    name: "Clopidogrel",
    genericName: "Clopidogrel",
    brand: "Sanofi",
    batchNumber: "CL7777",
    expiryDate: new Date("2026-12-31"),
    price: 80,
    stockQuantity: 90,
    description: "Prevents blood clots",
    createdBy: "699f3e5f549f3cda69eac8bb",
  },
  {
    name: "Furosemide",
    genericName: "Furosemide",
    brand: "Pfizer",
    batchNumber: "F8888",
    expiryDate: new Date("2026-07-31"),
    price: 40,
    stockQuantity: 120,
    description: "Diuretic for fluid retention",
    createdBy: "699f3e5f549f3cda69eac8bb",
  },
];

const MDBURI =
  process.env.MONGODB_URI ||
  "mongodb://127.0.0.1:27017/hospital_management_system";

export const seedMedicines = async () => {
  try {
    await mongoose.connect(MDBURI);

    console.log("Seeding Medicines...");

    for (const med of medicineInventory) {
      const existing = await MedicineModel.findOne({ name: med.name });
      if (existing) {
        console.log(`${med.name} already exists`);
        continue;
      }
      await MedicineModel.create(med);
    }

    console.log("Medicines Seeded Successfully!");
  } catch (error) {
    console.error("Seeding Error:", error);
  }
};

await seedMedicines();
