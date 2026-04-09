import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import UserModel from "../models/userModel.ts";
import { generateHmsId } from "../utils/generateId.ts";
import DoctorModel from "../models/doctorModel.ts";
import AppointmentModel from "../models/appointmentModel.ts";
import ConsultationModel from "../models/consultationModel.ts";
import PrescriptionModel from "../models/prescriptionModel.ts";
import LabOrderModel from "../models/labOrderModel.ts";
import NotificationModel from "../models/notificationModel.ts";
import PatientModel from "../models/patientModel.ts";

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

    const isPasswordValid = await bcrypt.compare(password, doctor.password);
    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const payload = {
      doctor: {
        id: doctor._id,
        id_no: doctor.id_no,
        email: doctor.email,
        role: doctor.role,
      },
    };

    const token = jwt.sign(payload, JWT_SECRET);

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

export const getDoctorDashboardDataController = async (req, res) => {
  try {
    const doctorId = req.user.doctor.id;

    const today = new Date().toISOString().split("T")[0];
    const now = new Date();

    // helper to combine date + time
    const combineDateTime = (dateStr, timeStr) => {
      const [time, modifier] = timeStr.split(" ");
      let [hours, minutes] = time.split(":").map(Number);

      if (modifier === "PM" && hours !== 12) hours += 12;
      if (modifier === "AM" && hours === 12) hours = 0;

      const date = new Date(dateStr);
      date.setHours(hours, minutes, 0, 0);

      return date;
    };

    // STATS
    const [
      todayAppointmentsCount,
      completedToday,
      pendingConsultations,
      totalPatients,
    ] = await Promise.all([
      AppointmentModel.countDocuments({
        doctorId,
        aptDate: today,
      }),
      AppointmentModel.countDocuments({
        doctorId,
        aptDate: today,
        status: "Completed",
      }),
      AppointmentModel.countDocuments({
        doctorId,
        aptDate: today,
        status: "Pending",
      }),
      AppointmentModel.distinct("patientId", { doctorId }),
    ]);

    const todayApts = await AppointmentModel.find({
      doctorId,
      aptDate: today,
    });

    const validApts = todayApts.filter(
      (apt) => apt.startedAt && apt.completedAt,
    );

    const totalTimeMs = validApts.reduce((acc, apt) => {
      const start = new Date(apt.startedAt);
      const end = new Date(apt.completedAt);

      return acc + (end - start);
    }, 0);

    const avgTimeMs = validApts.length > 0 ? totalTimeMs / validApts.length : 0;

    const avgConsultationTime = Math.round(avgTimeMs / (1000 * 60));

    const completionRate =
      todayAppointmentsCount > 0
        ? Math.round((completedToday / todayAppointmentsCount) * 100)
        : 0;

    // TODAY APPOINTMENTS
    const todayAppointmentsRaw = await AppointmentModel.find({
      doctorId,
      aptDate: today,
    }).populate("patientId", "fullName");

    const todayAppointments = todayAppointmentsRaw.map((apt) => ({
      _id: apt._id,
      id_no: apt.id_no,
      patientName: apt.patientId?.fullName || "Unknown",
      patientId: apt.patientId?._id,
      time: apt.appointmentTime,
      reason: apt.reasonForVisit,
      status: apt.status,
      shift: apt.shift,
    }));

    // NEXT PATIENTS
    const confirmedAppointments = await AppointmentModel.find({
      doctorId,
      status: "Confirmed",
      aptDate: today,
    }).populate("patientId", "fullName photo id_no");

    const nextPatients = confirmedAppointments
      .map((apt) => ({
        _id: apt._id,
        id_no: apt.id_no,
        patientName: apt.patientId?.fullName || "Unknown",
        patientId: apt.patientId?._id,
        time: apt.appointmentTime,
        reason: apt.reasonForVisit,
        status: apt.status,
        fullDateTime: combineDateTime(apt.aptDate, apt.appointmentTime),
        photo: apt.patientId ? apt.patientId?.photo : "",
      }))
      .filter((apt) => apt.fullDateTime > now)
      .sort((a, b) => a.fullDateTime - b.fullDateTime)
      .slice(0, 5)
      .map(({ fullDateTime, ...rest }) => rest);

    // RECENT ACTIVITY
    const prescriptions = await PrescriptionModel.find({ doctorId })
      .sort({ createdAt: -1 })
      .limit(2)
      .populate("patientId", "fullName");

    const labTests = await LabOrderModel.find({ doctorId })
      .sort({ createdAt: -1 })
      .limit(2)
      .populate("patientId", "fullName");

    const consultations = await AppointmentModel.find({
      doctorId,
      status: "Completed",
    })
      .sort({ updatedAt: -1 })
      .limit(2)
      .populate("patientId", "fullName");

    const recentActivity = [
      ...consultations.map((c) => ({
        _id: c._id,
        type: "consultation",
        patientName: c.patientId?.fullName || "Unknown",
        action: "Completed consultation",
        timestamp: c.updatedAt,
      })),
      ...prescriptions.map((p) => ({
        _id: p._id,
        type: "prescription",
        patientName: p.patientId?.fullName || "Unknown",
        action: "Added prescription",
        timestamp: p.createdAt,
      })),
      ...labTests.map((l) => ({
        _id: l._id,
        type: "labTest",
        patientName: l.patientId?.fullName || "Unknown",
        action: "Ordered lab test",
        timestamp: l.createdAt,
      })),
    ]
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 5);

    // NOTIFICATIONS
    const notificationsRaw = await NotificationModel.find({
      userId: doctorId,
    })
      .sort({ createdAt: -1 })
      .limit(5);

    const notifications = notificationsRaw.map((n) => ({
      _id: n._id,
      type: n.notificationType,
      message: n.message,
      timestamp: n.createdAt,
      isRead: n.isRead,
    }));

    // RESPONSE
    return res.status(200).json({
      success: true,
      stats: {
        todayAppointments: todayAppointmentsCount,
        pendingConsultations,
        completedToday,
        totalPatients: totalPatients.length,
        avgConsultationTime,
        completionRate,
      },
      nextPatients,
      todayAppointments,
      recentActivity,
      notifications,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export const getDoctorPatientDetailsController = async (req, res) => {
  try {
    const doctorId = req.user.doctor.id;

    const apts = await AppointmentModel.find({ doctorId }).populate(
      "patientId",
      "-password",
    );

    const consults = await ConsultationModel.find({ doctorId });

    let totalFollowUpRequired = 0;
    let totalActiveCases = 0;

    consults.forEach((con) => {
      if (con.followUp) totalFollowUpRequired += 1;
    });
    apts.forEach((apt) => {
      if (apt.status === "Pending" || apt.status === "Confirmed") {
        totalActiveCases += 1;
      }
    });

    const patientMap = {};

    apts.forEach((apt) => {
      const patient = apt.patientId;
      if (!patient) return;

      const id = patient._id.toString();

      if (!patientMap[id]) {
        patientMap[id] = {
          patientInfo: patient,
          totalAppointments: 0,
          totalVisits: 0,
          lastVisit: null,
          status: "Inactive",
          appointments: [],
        };
      }

      patientMap[id].totalAppointments += 1;
      patientMap[id].appointments.push(apt);

      if (apt.status === "Completed") {
        patientMap[id].totalVisits += 1;

        if (
          !patientMap[id].lastVisit ||
          new Date(apt.completedAt) > new Date(patientMap[id].lastVisit)
        ) {
          patientMap[id].lastVisit = apt.completedAt;
        }
      }
    });

    Object.keys(patientMap).forEach((id) => {
      const patientData = patientMap[id];
      const appointments = patientData.appointments;

      let status = "Inactive";

      for (const apt of appointments) {
        const hasFollowUp = consults.some(
          (con) =>
            con.appointmentId.toString() === apt._id.toString() && con.followUp,
        );

        if (hasFollowUp) {
          status = "Follow-up";
          break;
        }

        if (
          (apt.status === "Pending" || apt.status === "Confirmed") &&
          status !== "Follow-up"
        ) {
          status = "Active";
        }

        if (apt.status === "Completed" && status === "Inactive") {
          status = "Completed";
        }
      }

      patientData.status = status;
    });

    const patients = Object.values(patientMap);

    const totalPatients = await AppointmentModel.distinct("patientId", {
      doctorId,
    });

    res.status(200).json({
      success: true,
      message: "Patients record fetched!",
      patientRecords: {
        totalPatients: totalPatients.length,
        totalFollowUpRequired,
        totalActiveCases,
        patients,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export const getDoctorPatientProfileDetailsController = async (req, res) => {
  try {
    const doctorId = req.user.doctor.id;
    const patientId = req.params.patientId;
    const patient = await PatientModel.findById(patientId).select("-password");

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found",
      });
    }

    const [appointments, consultations, prescriptions, labOrders] =
      await Promise.all([
        AppointmentModel.find({
          doctorId,
          patientId,
        })
          .populate("doctorId", "fullName id_no photo")
          .sort({ createdAt: -1 }),
        ConsultationModel.find({
          doctorId,
          patientId,
        })
          .populate("doctorId", "fullName id_no photo")
          .sort({ createdAt: -1 }),
        PrescriptionModel.find({
          doctorId,
          patientId,
        })
          .populate("doctorId", "fullName id_no photo")
          .populate("dispensedBy", "fullName id_no photo")
          .sort({ createdAt: -1 }),
        LabOrderModel.find({
          doctorId,
          patientId,
        })
          .populate("doctorId", "fullName id_no photo")
          .sort({ createdAt: -1 }),
      ]);

    const totalAppointments = appointments.length;

    const completedAppointments = appointments.filter(
      (apt) => apt.status === "Completed",
    ).length;

    const prescriptionCount = prescriptions.filter(
      (p) => p.status === "Dispensed",
    ).length;

    const lastVisit = await AppointmentModel.findOne({
      doctorId,
      patientId,
      status: "Completed",
    })
      .sort({ completedAt: -1 })
      .select("completedAt");

    const currentMedications = prescriptions
      .filter((p) => p.status === "Dispensed")
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
      .flatMap((p) =>
        p.medicines.map((m) => ({
          medicationName: m.medicineName,
          dosage: m.dosage,
          frequency: m.frequency,
          duration: m.duration,
          instructions: m.instructions,
        })),
      );

    const currentLabTests = labOrders
      .filter((l) => l.tests.some((t) => t.status !== "Completed"))
      .flatMap((l) =>
        l.tests.map((t) => ({
          testName: t.testName,
          status: t.status,
          orderedAt: l.createdAt,
        })),
      );

    res.status(200).json({
      success: true,
      message: "Patient profile fetched!",
      patientProfile: {
        appointments,
        consultations,
        prescriptions,
        labOrders,
        patientInfo: patient,
        stats: {
          totalAppointments,
          completedAppointments,
          prescriptionCount,
          totalLabTests: labOrders.length,
          lastVisit: lastVisit ? lastVisit.completedAt : null,
        },
        currentMedications,
        currentLabTests,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export const getDoctorPrescriptionsController = async (req, res) => {
  try {
    const doctorId = req.user.doctor.id;
    const prescriptions = await PrescriptionModel.find({ doctorId })
      .populate("patientId", "id_no photo fullName")
      .populate("dispensedBy", "fullName")
      .sort({ createdAt: -1 });
    if (prescriptions.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Not founded any prescription!" });
    }
    return res.status(200).json({
      success: true,
      message: "Prescriptions fetched successfully",
      prescriptions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export const getDoctorLabTestReportsController = async (req, res) => {
  try {
    const doctorId = req.user.doctor.id;
    const labTests = await LabOrderModel.find({ doctorId })
      .populate("patientId", "id_no photo fullName email phoneNo")
      .populate({
        path: "tests.testId",
        select: "name departmentId",
        populate: {
          path: "departmentId",
          model: "LabDepartment",
          select: "name",
        },
      })
      .populate("doctorId", "fullName id_no photo")
      .sort({ createdAt: -1 });
    if (labTests.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Not founded any lab test!" });
    }
    res.status(200).json({
      success: true,
      message: "Lab tests fetched successfully",
      labTests,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export const getDoctorProfileDetailsController = async (req, res) => {
  try {
    const doctorId = req.user.doctor.id;
    const doctor = await DoctorModel.findById(doctorId)
      .populate("departmentId", "name")
      .populate("specialistId", "name");
    if (!doctor) {
      return res
        .status(404)
        .json({ success: false, message: "No doctor founded" });
    }
    return res.status(200).json({
      success: true,
      message: "Doctor profile details fetched successfully!",
      doctor,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export const updateDoctorProfileController = async (req, res) => {
  try {
    const doctorId = req.user.doctor.id;
    const {
      fullName,
      email,
      phoneNo,
      emergencyNo,
      dob,
      maritalStatus,
      address,
      specialization,
      qualification,
      yearsOfExperience,
    } = req.body;
    const doctor = await DoctorModel.findById(doctorId);
    if (!doctor) {
      return res
        .status(404)
        .json({ success: false, message: "No doctor founded" });
    }
    if (email && email !== doctor.email) {
      const existingUser = await UserModel.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: `Email already registered as ${existingUser.role}`,
        });
      }
    }
    if (fullName) doctor.fullName = fullName || doctor.fullName;
    if (email) doctor.email = email || doctor.email;
    if (phoneNo) doctor.phoneNo = phoneNo || doctor.phoneNo;
    if (emergencyNo) doctor.emergencyNo = emergencyNo || doctor.emergencyNo;
    if (dob) doctor.dob = dob || doctor.dob;
    if (maritalStatus)
      doctor.maritalStatus = maritalStatus || doctor.maritalStatus;
    if (address) doctor.address = address || doctor.address;
    if (req.file) {
      doctor.photo = req.file.filename;
    }

    if (specialization) doctor.specialization = specialization;
    if (qualification) doctor.qualification = qualification;
    if (yearsOfExperience) doctor.yearsOfExperience = yearsOfExperience;

    await doctor.save();
    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      doctor,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export const getDoctorNotificationsController = async (req, res) => {
  try {
    const doctorId = req.user.doctor.id;
    const notifications = await NotificationModel.find({
      userId: doctorId,
    }).populate("aptId");
    if (notifications.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No notification founded!" });
    }
    return res.status(200).json({
      success: true,
      message: "Doctor notifications fetched successfully!",
      notifications,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};
