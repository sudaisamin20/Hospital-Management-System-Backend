import AppointmentModel from "../models/appointmentModel.ts";
import NotificationModel from "../models/notificationModel.ts";
import { generateHmsId } from "../utils/generateId.ts";

interface IAptData {
  id_no: string;
  aptDate: date;
  departmentId: string;
  specialistId: string;
  doctorId: string;
  shift: string;
  appointmentTime: string;
  reasonForVisit: string;
  patientId: string;
  confirmedAt: Date;
  handleBy: string;
  completedAt: Date;
  show: boolean;
}

export const addAppointmentController = async (req, res) => {
  try {
    const addAptData = req.body as IAptData;

    const unique_id: string = generateHmsId("APT", 5);

    const newApt = new AppointmentModel({
      ...addAptData,
      id_no: unique_id,
    });
    await newApt.save();
    return res.status(200).json({
      success: true,
      message: "Appointment added successfully!",
      newApt,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error,
    });
  }
};

export const getAllAppointmentsController = async (req, res) => {
  try {
    const { recId } = req.params;
    const allPenApts = await AppointmentModel.find({
      "hiddenFor.userId": { $ne: recId },
    })
      .sort({ createdAt: -1 })
      .populate("departmentId", "name")
      .populate("specialistId", "name")
      .populate("doctorId", "fullName photo id_no")
      .populate("patientId", "-password");
    if (allPenApts.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No appointment founded!" });
    }
    return res.status(200).json({
      success: true,
      message: "Fetched all pending appointments",
      allPenApts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error,
    });
  }
};

export const fetchPatientAllAptsController = async (req, res) => {
  try {
    const { patientId } = req.params;
    const patientApts = await AppointmentModel.find({
      patientId,
      "hiddenFor.userId": { $ne: patientId },
    })
      .populate("departmentId", "name")
      .populate("specialistId", "name")
      .populate("doctorId", "fullName photo")
      .populate("patientId")
      .sort({ createdAt: -1 });
    if (patientApts.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No appointment founded!" });
    }
    return res
      .status(200)
      .json({ success: true, message: "Fetch all appointments", patientApts });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error,
    });
  }
};

export const cancelAppointmentController = async (req, res) => {
  try {
    const { id, status } = req.body;
    const cancelApt = await AppointmentModel.findByIdAndUpdate(
      id,
      { status, cancelledAt: Date.now() },
      { new: true },
    );
    if (!cancelApt) {
      return res
        .status(404)
        .json({ success: false, message: "Appointment not founded!" });
    }
    return res
      .status(201)
      .json({ success: true, message: "Appointment cancelled successfully!" });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error,
    });
  }
};

export const rescheduleAptDateController = async (req, res) => {
  try {
    const { id, aptDate, shift, appointmentTime } = req.body;
    const resApt = await AppointmentModel.findByIdAndUpdate(id, {
      aptDate,
      shift,
      appointmentTime,
    });
    if (!resApt) {
      return res
        .status(404)
        .json({ success: true, message: "Appointment not founded!" });
    }
    return res.status(201).json({
      success: true,
      message: "Appointment rescheduled successfully!",
      resApt,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error,
    });
  }
};

export const confirmAptStatusController = async (req, res) => {
  try {
    const { id, status, handleBy } = req.body;
    const apt = await AppointmentModel.findById(id)
      .populate("doctorId", "fullName")
      .populate("patientId", "fullName");
    if (!apt) {
      return res
        .status(404)
        .json({ success: false, message: "Appointment not founded!" });
    }
    if (apt.status !== "Pending") {
      return res.status(400).json({
        success: false,
        message: "Only pending appointment will be confirmed.",
      });
    }
    if (status) apt.status = status;
    if (handleBy) apt.handleBy = handleBy;
    apt.confirmedAt = Date.now();
    await apt.save();
    return res.status(201).json({
      success: true,
      message: `Appointment for ${apt.patientId.fullName} with ${apt.doctorId.fullName} has been confirmed for ${apt.aptDate} at ${apt.appointmentTime}.`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error,
    });
  }
};

export const completeAptStatusController = async (req, res) => {
  try {
    const { id, status } = req.body;
    const apt = await AppointmentModel.findById(id)
      .populate("doctorId", "fullName")
      .populate("patientId", "fullName");
    if (!apt) {
      return res
        .status(404)
        .json({ success: false, message: "Appointment not founded!" });
    }
    if (apt.status === "Pending") {
      return res.status(400).json({
        success: false,
        message:
          "This appointemnt has not been confirmed. You need to confirm first.",
      });
    }
    if (apt.status === "Completed") {
      return res.status(400).json({
        success: false,
        message: "This appointemnt has been confirmed and completed.",
      });
    }

    if (status) apt.status = status;
    apt.completedAt = Date.now();
    await apt.save();
    return res.status(201).json({
      success: true,
      message: `Appointment for ${apt.patientId.fullName} with ${apt.doctorId.fullName} has been completed.`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error,
    });
  }
};

export const deleteAptController = async (req, res) => {
  try {
    const { id, role, userId } = req.body;
    const apt = await AppointmentModel.findByIdAndUpdate(id, {
      $push: {
        hiddenFor: {
          role,
          userId,
        },
      },
    });
    console.log(apt);
    if (!apt) {
      return res
        .status(404)
        .json({ success: false, message: "Appointment not founded!" });
    }
    return res
      .status(201)
      .json({ success: true, message: "Appointment deleted successfully!" });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error,
    });
  }
};

export const approveResReqController = async (req, res) => {
  console.log(req.body);
  try {
    const { aptId, date, shift, time, rescheduleStatus, status, recId } =
      req.body;
    const apt = await AppointmentModel.findById(aptId).populate(
      "doctorId",
      "fullName photo",
    );
    if (!apt) {
      return res
        .status(404)
        .json({ success: false, message: "Appointment not founded!" });
    }
    apt.oldShiftApt = apt.shift;
    apt.oldAptTime = apt.appointmentTime;
    apt.oldAptDate = apt.aptDate;
    apt.aptDate = date;
    apt.shift = shift;
    apt.appointmentTime = time;
    apt.rescheduleStatus = rescheduleStatus;
    apt.status = status;
    apt.rescheduledAt = Date.now();
    apt.rescheduledBy = recId;
    await apt.save();

    await NotificationModel.create({
      userId: apt.patientId._id,
      title: "Appointment Rescheduled",
      message: `Your appointment with Dr. ${apt.doctorId.fullName} has been rescheduled to ${apt.aptDate.toISOString().split("T")[0]} at ${apt.appointmentTime}.`,
    });
    return res.status(201).json({
      success: true,
      message: "Reschedule request approved successfully!",
      apt,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error,
    });
  }
};

export const getDoctorAppointmentsController = async (req, res) => {
  try {
    const { id } = req.params;
    const docApts = await AppointmentModel.find({
      doctorId: id,
      status: { $in: ["Confirmed", "Completed"] },
    })
      .sort({ aptDate: -1 })
      .populate("departmentId", "name")
      .populate("specialistId", "name")
      .populate("doctorId", "fullName photo id_no")
      .populate("patientId");
    return res.status(200).json({
      success: true,
      message: "Fetched all doctor appointments.",
      docApts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error,
    });
  }
};

export const requestrescheduleController = async (req, res) => {
  try {
    const {
      id,
      newStatus,
      rescheduleReason,
      addDetails,
      rescheduleRequestedBy,
      suggestedSlots,
    } = req.body;
    const apt = await AppointmentModel.findById(id);
    if (!apt) {
      return res
        .status(404)
        .json({ success: false, message: "Appointment not founded" });
    }

    if (apt.status !== "Confirmed") {
      return res.status(400).json({
        success: false,
        message: "Only confirmed appointments can be rescheduled.",
      });
    }

    apt.status = newStatus;
    apt.rescheduleReason = rescheduleReason;
    apt.addDetails = addDetails;
    apt.rescheduleRequestedAt = Date.now();
    apt.rescheduleRequestedBy = rescheduleRequestedBy;
    apt.suggestedSlots = suggestedSlots || [];

    await apt.save();
    return res.status(201).json({
      success: true,
      message:
        "Request for rescheduling appointment is forwared to the receptionist.",
      apt,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error,
    });
  }
};

export const getResReqsAptsController = async (req, res) => {
  try {
    const resReqApts = await AppointmentModel.find({
      status: "Reschedule Requested",
    })
      .populate("departmentId", "name")
      .populate("specialistId", "name")
      .populate("doctorId", "fullName photo")
      .populate("patientId");
    return res.status(200).json({
      success: true,
      message: "Fetched reschedule requested appointments.",
      resReqApts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error,
    });
  }
};

export const getAllPatientNotificationsController = async (req, res) => {
  try {
    const { patientId } = req.params;
    const patNots = await NotificationModel.find({
      userId: patientId,
    })
      .populate({
        path: "aptId",
        populate: [
          { path: "patientId", select: "fullName photo" },
          { path: "departmentId", select: "name" },
          { path: "specialistId", select: "name" },
          { path: "doctorId", select: "fullName photo id_no" },
        ],
      })
      .sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      message: "Fetch all notification messages",
      patNots,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error,
    });
  }
};
