import DepartmentModel from "../models/departmentModel.ts";
import SpecialistModel from "../models/specialistModel.ts";

const doctorDepartments = [
  {
    department: "Cardiology",
    specialists: [
      "Cardiologist",
      "Interventional Cardiologist",
      "Pediatric Cardiologist",
      "Cardiac Surgeon",
      "Electrophysiologist",
    ],
  },

  {
    department: "Neurology",
    specialists: [
      "Neurologist",
      "Neurosurgeon",
      "Stroke Specialist",
      "Epilepsy Specialist",
      "Pediatric Neurologist",
    ],
  },

  {
    department: "Pediatrics",
    specialists: [
      "Pediatrician",
      "Neonatologist",
      "Pediatric Surgeon",
      "Child Development Specialist",
      "Pediatric Cardiologist",
    ],
  },

  {
    department: "Orthopedics",
    specialists: [
      "Orthopedic Surgeon",
      "Spine Specialist",
      "Sports Injury Specialist",
      "Joint Replacement Specialist",
      "Pediatric Orthopedic Specialist",
    ],
  },

  {
    department: "Dermatology",
    specialists: [
      "Dermatologist",
      "Cosmetic Dermatologist",
      "Pediatric Dermatologist",
      "Skin Allergy Specialist",
      "Hair Specialist (Trichologist)",
    ],
  },

  {
    department: "General Medicine",
    specialists: [
      "General Physician",
      "Internal Medicine Specialist",
      "Family Medicine Doctor",
      "Preventive Care Specialist",
      "Infectious Disease Specialist",
    ],
  },

  {
    department: "Surgery",
    specialists: [
      "General Surgeon",
      "Laparoscopic Surgeon",
      "Trauma Surgeon",
      "Vascular Surgeon",
      "Surgical Oncologist",
    ],
  },

  {
    department: "Gynecology",
    specialists: [
      "Gynecologist",
      "Obstetrician",
      "Fertility Specialist",
      "Maternal-Fetal Medicine Specialist",
      "Gynecologic Surgeon",
    ],
  },

  {
    department: "Psychiatry",
    specialists: [
      "Psychiatrist",
      "Child Psychiatrist",
      "Addiction Specialist",
      "Behavioral Specialist",
      "Clinical Psychotherapist",
    ],
  },

  {
    department: "Radiology",
    specialists: [
      "Radiologist",
      "Diagnostic Radiologist",
      "Interventional Radiologist",
      "MRI Specialist",
      "CT Scan Specialist",
    ],
  },

  {
    department: "Anesthesiology",
    specialists: [
      "Anesthesiologist",
      "Pain Management Specialist",
      "Critical Care Anesthesiologist",
      "Cardiac Anesthesia Specialist",
      "Pediatric Anesthesiologist",
    ],
  },

  {
    department: "Emergency Medicine",
    specialists: [
      "Emergency Physician",
      "Trauma Specialist",
      "Critical Care Specialist",
      "Acute Care Specialist",
      "ER Consultant",
    ],
  },
];

export const seedDepartments = async () => {
  try {
    console.log("Seeding Departments...");

    for (const dep of doctorDepartments) {
      const existing = await DepartmentModel.findOne({ name: dep.department });

      if (existing) {
        console.log(`${dep.department} already exists`);
        continue;
      }

      const createdDepartment = await DepartmentModel.create({
        name: dep.department,
      });

      for (const spec of dep.specialists) {
        await SpecialistModel.create({
          name: spec,
          departmentId: createdDepartment._id,
        });
      }
    }

    console.log("Departments Seeded Successfully!");
  } catch (error) {
    console.error("Seeding Error:", error);
  }
};

await seedDepartments();
