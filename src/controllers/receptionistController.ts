import bcrypt from "bcryptjs";
import UserModel from "../models/userModel.ts";
import ReceptionistModel from "../models/receptionistModel.ts";
import { generateHmsId } from "../utils/generateId.ts";
import jwt from "jsonwebtoken";
import AppointmentModel from "../models/appointmentModel.ts";

const JWT_SECRET: string = process.env.JWT_SECRET || "defaultsecret";

interface RequestData {
  fullName: string;
  role: string;
  email: string;
  phoneNo: string;
  doj: string;
  salary: string;
  qualification: string;
  emergencyNo: string;
  martialStatus: string;
  dob: string;
  address: string;
  password: string;
  yearsOfExperience: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const registerReceptionistController = async (
  req,
  res,
): Promise<void> => {
  try {
    const photo: string = req.file?.filename;
    const receptionistData = req.body as RequestData;
    const existingRec = await UserModel.findOne({
      email: receptionistData.email,
    });
    if (existingRec) {
      return res.status(400).json({
        success: true,
        message: `Email already register as ${existingRec.role}`,
      });
    }

    const hashedPassword = await bcrypt.hash(receptionistData.password, 10);

    const id_no = generateHmsId("REC", 5);

    const newRec = new ReceptionistModel({
      ...receptionistData,
      id_no,
      password: hashedPassword,
      photo,
      isActive: true,
    });
    await newRec.save();

    const payload = {
      receptionist: {
        id_no,
        id: newRec._id,
        email: newRec.email,
        phoneNo: newRec.phoneNo,
        role: newRec.role,
      },
    };

    const token = jwt.sign(payload, JWT_SECRET);

    res.status(200).json({
      user: {
        id: newRec._id,
        id_no: newRec.id_no,
        fullName: newRec.fullName,
        email: newRec.email,
        phoneNo: newRec.phoneNo,
        role: newRec.role,
      },
      message: "receptionist register successfully",
      success: true,
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

interface LoginRequestBody {
  id_no: string;
  email: string;
  password: string;
}

export const loginReceptionistController = async (req, res) => {
  try {
    const { id_no, email, password } = req.body as LoginRequestBody;
    const JWT_SECRET: string = process.env.JWT_SECRET || "defaultsecret";

    const receptionist = await ReceptionistModel.findOne({ email, id_no });

    if (!receptionist) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    if (!receptionist.isActive) {
      return res.status(403).json({
        success: false,
        message: "Your account has been deactivated",
      });
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      receptionist.password,
    );
    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const payload = {
      receptionist: {
        id: receptionist._id,
        id_no: receptionist.id_no,
        email: receptionist.email,
        role: receptionist.role,
      },
    };

    const token = jwt.sign(payload, JWT_SECRET);

    res.status(200).json({
      success: true,
      message: `${receptionist.role.charAt(0).toUpperCase() + receptionist.role.slice(1)} login successful`,
      user: {
        id: receptionist._id,
        id_no: receptionist.id_no,
        fullName: receptionist.fullName,
        email: receptionist.email,
        phoneNo: receptionist.phoneNo,
        role: receptionist.role,
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

export const markAsSeenResReqAptsController = async (req, res) => {
  try {
    const userId = req.user?.user?.id || req.user?.receptionist?.id;

    await AppointmentModel.updateMany(
      {
        handleBy: userId,
        resReqSeen: false,
        rescheduleRequestedBy: { $exists: true, $ne: null },
      },
      {
        $set: { resReqSeen: true },
      },
    );

    return res.status(201).json({
      success: true,
      message: "Requests for rescheduling appointments are marked as seen!",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error,
    });
  }
};
