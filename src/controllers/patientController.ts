import bcrypt from "bcryptjs";
import PatientModel from "../models/patientModel.ts";
import UserModel from "../models/userModel.ts";
import jwt from "jsonwebtoken";
import { generateHmsId } from "../utils/generateId.ts";
import DoctorModel from "../models/doctorModel.ts";
import NotificationModel from "../models/notificationModel.ts";
import AppointmentModel from "../models/appointmentModel.ts";
import ConsultationModel from "../models/consultationModel.ts";
import PrescriptionModel from "../models/prescriptionModel.ts";
import LabOrderModel from "../models/labOrderModel.ts";

interface PatientData {
  id_no: string;
  fullName: string;
  dob: string;
  gender: string;
  phoneNo: string;
  email: string;
  address: string;
  emergencyNo: string;
  password: string;
  agreeTerms: boolean;
}

export const patientRegisterController = async (req, res): Promise<any> => {
  try {
    const JWT_SECRET: string = process.env.JWT_SECRET || "defaultsecret";
    const patientData = req.body as PatientData;
    const existingUser = await UserModel.findOne({ email: patientData.email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: `Email already registered as ${existingUser.role}`,
      });
    }

    const hashedPassword = await bcrypt.hash(patientData.password, 10);

    let id_no = generateHmsId("PAT", 5);

    const checkId_No = await UserModel.findOne({ id_no });

    const newPatient = new PatientModel({
      id_no,
      fullName: patientData.fullName,
      email: patientData.email,
      password: hashedPassword,
      phoneNo: patientData.phoneNo,
      dob: patientData.dob,
      gender: patientData.gender,
      address: patientData.address,
      emergencyNo: patientData.emergencyNo,
      agreeTerms: patientData.agreeTerms,
      role: "patient",
      isActive: true,
    });

    await newPatient.save();

    const payload = {
      patient: {
        id: newPatient._id,
        email: newPatient.email,
        fullName: newPatient.fullName,
        role: "patient",
      },
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });

    res.status(201).json({
      success: true,
      message: "Patient registered successfully",
      user: {
        id: newPatient._id,
        fullName: newPatient.fullName,
        email: newPatient.email,
        phoneNo: newPatient.phoneNo,
        role: "patient",
      },
      token,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error registering patient",
      error,
    });
  }
};

interface LoginRequestBody {
  id_no: string;
  email: string;
  password: string;
  role: string;
}

export const patientLoginController = async (req, res): Promise<any> => {
  try {
    const { id_no, email, password, role } = req.body as LoginRequestBody;
    const JWT_SECRET: string = process.env.JWT_SECRET || "defaultsecret";

    const user = await PatientModel.findOne({ email, id_no });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }
    if (user.role !== role) {
      return res.status(400).json({
        success: false,
        message: `Selected wrong role!`,
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Your account has been deactivated",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const payload = {
      patient: {
        id: user._id,
        id_no: user.id_no,
        email: user.email,
        role: user.role,
      },
    };

    const token = jwt.sign(payload, JWT_SECRET);

    res.status(200).json({
      success: true,
      message: `${user.role.charAt(0).toUpperCase() + user.role.slice(1)} login successful`,
      user: {
        id: user._id,
        id_no: user.id_no,
        fullName: user.fullName,
        email: user.email,
        phoneNo: user.phoneNo,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Login failed",
      error,
    });
  }
};

export const fetchRelatedDoctorsController = async (req, res) => {
  try {
    const { departmentId, specialistId } = req.params;
    const doctors = await DoctorModel.find({
      departmentId: departmentId,
      specialistId: specialistId,
    });
    if (doctors.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No doctors found!" });
    }
    return res.status(200).json({
      success: true,
      message: "Doctors fetched successfully",
      doctors,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error,
    });
  }
};

export const getPatientMedicalRecordController = async (req, res) => {
  try {
    const patientId = req.user.patient.id;

    // 1️⃣ Fetch Patient Overview
    const patient = await PatientModel.findById(patientId);
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found",
      });
    }

    // Calculate age from DOB
    const dob = new Date(patient.dob);
    const today = new Date();
    const age = Math.floor(
      (today.getTime() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000),
    );

    const [appointments, consultations, prescriptions, labOrders] =
      await Promise.all([
        AppointmentModel.find({ patientId })
          .populate("doctorId", "fullName photo id_no")
          .populate("departmentId", "name")
          .sort({ createdAt: -1 }),

        ConsultationModel.find({ patientId })
          .populate("doctorId", "fullName photo id_no")
          .sort({ createdAt: -1 }),

        PrescriptionModel.find({ patientId })
          .populate("doctorId", "fullName photo id_no")
          .populate("dispensedBy", "fullName photo id_no")
          .sort({ createdAt: -1 }),

        LabOrderModel.find({ patientId })
          .populate("doctorId", "fullName photo id_no")
          .sort({ createdAt: -1 }),
      ]);

    const formattedAppointments = appointments.map((apt) => ({
      _id: apt._id,
      id_no: apt.id_no,
      date: apt.aptDate,
      time: apt.appointmentTime,
      shift: apt.shift,
      doctor: apt.doctorId?.fullName || "N/A",
      department: apt.departmentId?.name || "N/A",
      status: apt.status,
      reason: apt.reasonForVisit,
      completedAt: apt.completedAt || null,
      confirmedAt: apt.confirmedAt || null,
      rescheduleStatus: apt.rescheduleStatus || null,
      rescheduleReason: apt.rescheduleReason || null,
      rescheduledAt: apt.rescheduledAt || null,
      oldAptDate: apt.oldAptDate || null,
      oldAptTime: apt.oldAptTime || null,
      oldShiftApt: apt.oldShiftApt || null,
      addDetails: apt.addDetails || null,
    }));

    const formattedConsultations = consultations.map((cons) => ({
      _id: cons._id,
      date: cons.createdAt,
      doctor: cons.doctorId?.fullName || "N/A",
      diagnosis: cons.diagnosis,
      symptoms: cons.symptoms,
      notes: cons.additionalNotes,
      vitals: {
        bloodPressure: cons.vitals?.bloodPressure || "N/A",
        heartRate: cons.vitals?.heartRate || "N/A",
        temperature: cons.vitals?.temperature || "N/A",
        weight: cons.vitals?.weight || "N/A",
        height: cons.vitals?.height || "N/A",
      },
    }));

    const formattedPrescriptions = prescriptions.map((pres) => ({
      _id: pres._id,
      id_no: pres.id_no,
      date: pres.createdAt,
      doctor: pres.doctorId || "N/A",
      medicines: pres.medicines.map((med) => ({
        name: med.medicineName,
        dosage: med.dosage,
        timing: med.timing,
        frequency: med.frequency,
        duration: med.duration,
        instructions: med.instructions,
        quantity: med?.duration * med?.frequency,
      })),
      status: pres.status,
      resultPDF: pres.resultPDF,
      dispensedBy: pres.dispensedBy,
      dispensedAt: pres.dispensedAt,
    }));

    const formattedLabTests = labOrders.flatMap((order) =>
      order.tests.map((test) => ({
        _id: test._id || order._id,
        id_no: test.id_no,
        testName: test.testName,
        date: test.completedAt || order.createdAt,
        status: test.status,
        resultPDF: test.resultPDF,
        orderedBy: order.doctorId?.fullName || "N/A",
        results: test.results || [],
        remarks: test.remarks,
      })),
    );

    // 6️⃣ Get Latest Appointment for Last Visit
    const lastAppointment = appointments.length > 0 ? appointments[0] : null;
    const lastVisit = lastAppointment?.aptDate || patient.createdAt;

    // 7️⃣ Combine All Data
    const medicalRecords = {
      patientOverview: {
        fullName: patient.fullName,
        id_no: patient.id_no,
        age,
        gender: patient.gender,
        bloodGroup: patient.bloodGroup || "N/A",
        lastVisit,
        totalAppointments: appointments.length,
        allergies: patient.allergies || [],
        email: patient.email,
        phoneNo: patient.phoneNo,
      },
      appointments: formattedAppointments,
      consultations: formattedConsultations,
      prescriptions: formattedPrescriptions,
      labTests: formattedLabTests,
    };

    res.status(200).json({
      success: true,
      message: "Medical records fetched successfully",
      medicalRecords,
    });
  } catch (error) {
    console.error("Error fetching medical records:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const getPatientProfileDetails = async (req, res) => {
  try {
    const patientId = req.user.patient.id;
    const patient = await UserModel.findById(patientId).select("-password");
    if (!patient) {
      return res
        .status(404)
        .json({ success: true, message: "No patient founded!" });
    }
    return res.status(200).json({
      success: true,
      message: "Patient profile details fetched!",
      patient,
    });
  } catch (error) {
    console.error("Error fetching medical records:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const updatePatientProfileController = async (req, res) => {
  try {
    const patientId = req.user.patient.id;
    const {
      fullName,
      email,
      phoneNo,
      dob,
      gender,
      bloodGroup,
      emergencyNo,
      address,
    } = req.body;
    const patient = await PatientModel.findById(patientId);
    if (!patient) {
      return res
        .status(404)
        .status({ success: false, message: "Patient not founded" });
    }

    if (fullName) patient.fullName = fullName;
    if (email) patient.email = email;
    if (phoneNo) patient.phoneNo = phoneNo;
    if (dob) patient.dob = dob;
    if (gender) patient.gender = gender;
    if (bloodGroup) patient.bloodGroup = bloodGroup;
    if (emergencyNo) patient.emergencyNo = emergencyNo;
    if (address) patient.address = address;
    await patient.save();

    return res.status(201).json({
      success: true,
      message: "Profile updated successfully!",
      patient,
    });
  } catch (error) {
    console.error("Error fetching medical records:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const changePasswordController = async (req, res) => {
  try {
    const patientId = req.user.patient.id;
    const { currentPassword, newPassword } = req.body;
    const patient = await PatientModel.findById(patientId);
    if (!patient) {
      return res
        .status(404)
        .status({ success: false, message: "Patient not founded" });
    }
    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      patient.password,
    );
    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid password! Please enter correct current password to change password.",
      });
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    patient.password = hashedPassword;
    await patient.save();
    return res.status(201).json({
      success: true,
      message: "Password changed successfully!",
      patient,
    });
  } catch (error) {
    console.error("Error fetching medical records:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const changeProfilePhotoController = async (req, res) => {
  try {
    const patientId = req.user.patient.id;
    const photo = req.file.filename;
    const patient = await PatientModel.findById(patientId);
    if (!patient) {
      return res
        .status(404)
        .status({ success: false, message: "Patient not founded" });
    }
    patient.photo = photo;
    await patient.save();
    return res.status(201).json({
      success: true,
      message: "Profile photo changed successfully!",
      patient,
    });
  } catch (error) {
    console.error("Error fetching medical records:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
