import bcrypt from "bcryptjs";
import PharmacistModel from "../models/pharmacistModel.ts";
import { generateHmsId } from "../utils/generateId.ts";
import jwt from "jsonwebtoken";
import PrescriptionModel from "../models/prescriptionModel.ts";

const JWT_SECRET: string = process.env.JWT_SECRET || "defaultsecret";

export const registerPharmacistController = async (req, res) => {
  try {
    const pharmacistData = req.body;
    const photo: string = req.file.filename;
    console.log(req.body.password, photo);
    const existingPharmacist = await PharmacistModel.findOne({
      email: pharmacistData.email,
    });
    if (existingPharmacist) {
      return res.status(400).json({
        success: false,
        message: `User with this email already exist on ${existingPharmacist.role} Role`,
      });
    }

    const hashedPassword = await bcrypt.hash(pharmacistData.password, 10);
    const id_no = generateHmsId("PHARM", 5);

    const newPharmacist = new PharmacistModel({
      ...pharmacistData,
      id_no,
      password: hashedPassword,
      photo,
      isActive: true,
      branch: "Branch 1",
    });
    await newPharmacist.save();

    const payload = {
      pharmacist: {
        id: newPharmacist._id,
        fullName: newPharmacist.fullName,
        email: newPharmacist.email,
        phoneNo: newPharmacist.phoneNo,
      },
    };
    const token = jwt.sign(payload, JWT_SECRET);
    res.status(201).json({
      success: true,
      message: "Pharmacist registered successfully",
      pharmacist: {
        id: newPharmacist._id,
        id_no: newPharmacist.id_no,
        fullName: newPharmacist.fullName,
        email: newPharmacist.email,
        phoneNo: newPharmacist.phoneNo,
        role: newPharmacist.role,
      },
      token,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error,
    });
  }
};

export const loginPharmacistController = async (req, res) => {
  try {
    const { id_no, email, password, role } = req.body;

    const pharmacist = await PharmacistModel.findOne({ id_no, email });

    if (!pharmacist) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });
    }
    console.log(role, pharmacist.role);
    if (pharmacist.role !== role) {
      return res.status(400).json({
        success: false,
        message: `Selected wrong role! Please select the Pharmacist role in the options.`,
      });
    }

    const isPasswordValid = await bcrypt.compare(password, pharmacist.password);

    if (!isPasswordValid) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });
    }

    const payload = {
      pharmacist: {
        id: pharmacist._id,
        fullName: pharmacist.fullName,
        email: pharmacist.email,
        phoneNo: pharmacist.phoneNo,
      },
    };

    const token = jwt.sign(payload, JWT_SECRET);

    res.status(200).json({
      success: true,
      message: "Pharmacist logged in successfully",
      pharmacist: {
        id: pharmacist._id,
        id_no: pharmacist.id_no,
        fullName: pharmacist.fullName,
        email: pharmacist.email,
        phoneNo: pharmacist.phoneNo,
        role: pharmacist.role,
      },
      token,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error,
    });
  }
};
