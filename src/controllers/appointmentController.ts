import AppointmentModel from "../models/appointmentModel.ts";
import NotificationModel from "../models/notificationModel.ts";
import ReceptionistModel from "../models/receptionistModel.ts";
import { generateHmsId } from "../utils/generateId.ts";
import { io } from "../index.ts";
import { emitNotification } from "../utils/emitters.ts";

interface IAptData {
  id_no: string;
  aptDate: string;
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
  updatedAt: Date;
  startedAt: Date;
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

    const populatedAppointments = await newApt.populate([
      { path: "patientId", select: "-password" },
      { path: "doctorId", select: "fullName photo id_no" },
      { path: "departmentId", select: "name" },
      { path: "specialistId", select: "name" },
    ]);

    io.to("receptionists").emit("newAppointment", {
      appointment: populatedAppointments,
    });
    io.to("receptionists").emit("notification");
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
      .populate("doctorId", "fullName photo id_no")
      .populate("departmentId", "name")
      .populate("specialistId", "name")
      .populate("patientId", "fullName id_no email phoneNo");
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
    apt.updatedAt = Date.now();
    await apt.save();

    io.to(`doctor_${apt.doctorId._id}`).emit("appointmentConfirmed", {
      appointment: apt,
    });

    io.to(`patient_${apt.patientId._id}`).emit("appointmentConfirmed", {
      appointment: apt,
    });

    const rec = await ReceptionistModel.findById(handleBy);

    const docNot = await NotificationModel.create({
      userId: apt.doctorId._id,
      title: "Appointment Confirmed",
      message: `Appointment confirmed with ${apt.patientId.fullName} on ${apt.aptDate} at ${apt.appointmentTime} handle by receptionist ${rec?.fullName}.`,
      aptId: apt._id,
      notificationType: "appointment_confirmed",
    });

    emitNotification({ doctorId: apt.doctorId._id });

    io.to(`doctor_${apt.doctorId._id}`).emit("newNotification", {
      docNot,
    });

    const patNot = await NotificationModel.create({
      userId: apt.patientId._id,
      title: "Appointment Confirmed",
      message: `Your appointment has been confirmed with Dr. ${apt.doctorId.fullName} on ${apt.aptDate} at ${apt.appointmentTime} handle by receptionist ${apt?.handleBy?.fullName}. You are informed that please arrive 15 minutes early before appointment time.`,
      aptId: apt._id,
      notificationType: "appointment_confirmed",
    });

    io.to(`patient_${apt.patientId._id}`).emit("notification");

    io.to(`patient${apt.patientId._id}`).emit("newNotification", {
      patNot,
    });

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
      .populate("patientId", "fullName")
      .populate("handleBy", "fullName");
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
    apt.updatedAt = Date.now();
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
  try {
    const { aptId, date, shift, time, rescheduleStatus, status, recId } =
      req.body;
    const apt = await AppointmentModel.findById(aptId)
      .populate("doctorId", "fullName photo")
      .populate("patientId", "-password");
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

    const not = await NotificationModel.create({
      userId: apt.patientId._id,
      title: "Appointment Rescheduled",
      notificationType: "reschedule_approved",
      message: `Your appointment with Dr. ${apt.doctorId.fullName} has been rescheduled from ${apt.oldAptDate.toLocaleDateString(
        "en-US",
        {
          month: "short",
          day: "numeric",
          year: "numeric",
        },
      )} at ${apt.oldAptTime} to ${apt.aptDate.split("T")[0]} at ${apt.appointmentTime}. See details! If you are not happy with the current changes you can cancel the appointment and book new appointment.`,
      aptId: apt._id,
    });
    const patNot = await NotificationModel.findById(not._id)
      .populate("aptId")
      .populate({
        path: "aptId",
        populate: [
          { path: "departmentId", select: "name" },
          { path: "specialistId", select: "name" },
          { path: "doctorId", select: "fullName photo id_no" },
          { path: "patientId", select: "fullName photo id_no email phoneNo" },
        ],
      });
    io.to(`patient_${apt.patientId._id}`).emit("notification");
    io.to(`patient_${apt.patientId._id}`).emit("newNotification", {
      patNot,
    });

    const not2 = await NotificationModel.create({
      userId: apt.doctorId._id,
      title: "Appointment Reschedule Request Approved",
      notificationType: "reschedule_approved",
      message: `Your appointment with Patient ${apt.patientId.fullName} on ${apt.oldAptDate?.toLocaleDateString(
        "en-US",
        {
          month: "short",
          day: "numeric",
          year: "numeric",
        },
      )} at ${apt.oldAptTime} has been rescheduled to ${apt.aptDate.split("T")[0]} at ${apt.appointmentTime}. See details!`,
      aptId: apt._id,
    });

    const docNot = await NotificationModel.findById(not2._id)
      .populate("aptId")
      .populate({
        path: "aptId",
        populate: [
          { path: "departmentId", select: "name" },
          { path: "specialistId", select: "name" },
          { path: "doctorId", select: "fullName photo id_no" },
          { path: "patientId", select: "fullName photo id_no email phoneNo" },
        ],
      });
    console.log(apt.doctorId._id);
    io.to(`doctor_${apt.doctorId._id}`).emit("notification");
    io.to(`doctor_${apt.doctorId._id}`).emit("newNotification", {
      docNot,
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
      .sort({ createdAt: -1 })
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
    const apt = await AppointmentModel.findById(id)
      .populate("patientId", "-password")
      .populate("doctorId", "fullName id_no email photo phoneNo")
      .populate("departmentId", "name")
      .populate("specialistId", "name")
      .sort({ rescheduleRequestedAt: -1 });
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
    apt.rescheduleStatus = "Pending";
    apt.rescheduleReason = rescheduleReason;
    apt.addDetails = addDetails;
    apt.rescheduleRequestedAt = Date.now();
    apt.rescheduleRequestedBy = rescheduleRequestedBy;
    apt.suggestedSlots = suggestedSlots || [];

    const recNot = await NotificationModel.create({
      userId: apt.handleBy,
      title: "Reschedule Appointment Request",
      notificationType: "reschedule_requested",
      message: `Dr. ${apt.doctorId.fullName} wants to reschedule an appointment. Check the details for rescheduling appointment.`,
      aptId: apt._id,
    });

    io.to(`receptionist_${apt.handleBy}`).emit("notification");
    io.to(`receptionist_${apt.handleBy}`).emit("newNotification", {
      recNot,
    });
    io.to(`receptionist_${apt.handleBy}`).emit("resReqApt", {
      appointment: apt,
    });

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

export const rejectResReqAptController = async (req, res) => {
  try {
    const { appointmentId, status } = req.body;
    const apt = await AppointmentModel.findById(appointmentId)
      .populate("departmentId", "name")
      .populate("specialistId", "name")
      .populate("doctorId", "fullName photo")
      .populate("patientId", "-password");
    if (!apt) {
      return res
        .status(404)
        .json({ success: false, message: "No appointment founded!" });
    }
    apt.rescheduleStatus = status;
    apt.status = "Confirmed";
    apt.rejectedAt = new Date(Date.now());
    await apt.save();

    const not = await NotificationModel.create({
      userId: apt.doctorId._id,
      title: "Appointment Reschedule Request Rejected",
      message: `Your request for rescheduling appointment has been rejected! Appointment ID is ${apt._id}. Make sure you present on the appointment day!`,
      notificationType: "reschedule_rejected",
      aptId: apt._id,
    });

    const docNot = await NotificationModel.findById(not._id)
      .populate("aptId")
      .populate({
        path: "aptId",
        populate: [
          { path: "departmentId", select: "name" },
          { path: "specialistId", select: "name" },
          { path: "doctorId", select: "fullName photo id_no" },
          { path: "patientId", select: "fullName photo id_no email phoneNo" },
        ],
      });

    io.to(`doctor_${apt.doctorId._id}`).emit("notification");
    io.to(`doctor_${apt.doctorId._id}`).emit("newNotification", {
      docNot,
    });

    return res.status(201).json({
      success: true,
      message: "Appointment request for rescheduling has been rejected!",
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

export const setStartedAptTimeController = async (req, res) => {
  try {
    const { aptId } = req.body;
    const apt = await AppointmentModel.findById(aptId);
    if (!apt) {
      return res
        .status(404)
        .json({ success: false, message: "Appointment not founded!" });
    }
    apt.startedAt = Date.now();
    await apt.save();
    return res
      .status(201)
      .json({ success: true, message: "Appointment started!" });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error,
    });
  }
};

export const markAsSeenAppointmentsController = async (req, res) => {
  try {
    const userId =
      req.user?.user?.id ||
      req.user?.receptionist?.id ||
      req.user?.doctor?.id ||
      req.user?.patient?.id;
    await AppointmentModel.updateMany(
      {
        seenBy: { $ne: userId },
      },
      {
        $addToSet: { seenBy: userId },
      },
    );
    return res.status(200).json({
      success: true,
      message: "Appointment marked as viewed successfully!",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error,
    });
  }
};
