import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import UserModel from "../models/userModel.ts";
import { generateHmsId } from "../utils/generateId.ts";
import DoctorModel from "../models/doctorModel.ts";

const JWT_SECRET: string = process.env.JWT_SECRET || "defaultsecret";

interface RequestData {
  id_no: string;
  fullName: string;
  role: string;
  email: string;
  phoneNo: string;
  departmentId: string;
  specialistId: string;
  licenseNo: string;
  specialization: string;
  martialStatus: string;
  doj: string;
  dob: string;
  salary: string;
  qualification: string;
  emergencyNo: string;
  address: string;
  photo: string;
  password: string;
  yearsOfExperience: string;
  qualifications: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const registerDoctorController = async (req, res): Promise<void> => {
  try {
    if (!req?.body.licenseNo) {
      return res
        .status(400)
        .json({ success: false, message: "License number is required" });
    }
    const doctorData = req.body as RequestData;
    const photo: string = req?.file?.filename;
    const existingUser = await UserModel.findOne({ email: doctorData.email });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: `Email already registered as ${existingUser.role}`,
      });
    }
    const hashedPassword = await bcrypt.hash(doctorData.password, 10);

    const id_no = generateHmsId("DOC", 5);

    const newDoc = new DoctorModel({
      ...doctorData,
      id_no,
      password: hashedPassword,
      photo,
      isActive: true,
    });
    await newDoc.save();

    const payload = {
      doctor: {
        id: newDoc._id,
        fullName: newDoc.fullName,
        email: newDoc.email,
        phoneNo: newDoc.phoneNo,
      },
    };
    const token = jwt.sign(payload, JWT_SECRET);
    res.status(201).json({
      success: true,
      message: "Doctor registered successfully",
      doctor: newDoc,
      token,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message || error,
    });
  }
};

export const loginDoctorController = async (req, res) => {
  try {
    const { id_no, email, password, role } = req.body;
    console.log(req.body);
    const doctor = await DoctorModel.findOne({ id_no, email });
    if (!doctor) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    if (doctor.role !== role) {
      return res.status(400).json({
        success: false,
        message: `Selected wrong role!`,
      });
    }

    // if (!doctor.isActive) {
    //   return res.status(403).json({
    //     success: false,
    //     message: "Your account has been deactivated",
    //   });
    // }

    const isPasswordValid = await bcrypt.compare(password, doctor.password);
    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const token = jwt.sign(
      {
        id: doctor._id,
        id_no: doctor.id_no,
        email: doctor.email,
        role: doctor.role,
      },
      JWT_SECRET,
    );

    res.status(200).json({
      success: true,
      message: `${doctor.role.charAt(0).toUpperCase() + doctor.role.slice(1)} login successful`,
      doctor: {
        id: doctor._id,
        id_no: doctor.id_no,
        fullName: doctor.fullName,
        email: doctor.email,
        phoneNo: doctor.phoneNo,
        role: doctor.role,
      },
      token,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message || error,
    });
  }
};
