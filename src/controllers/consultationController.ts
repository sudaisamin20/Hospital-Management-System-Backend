import AppointmentModel from "../models/appointmentModel.ts";
import ConsultationModel from "../models/consultationModel.ts";
import LabOrderModel from "../models/labOrderModel.ts";
import PrescriptionModel from "../models/prescriptionModel.ts";
import { generateHmsId } from "../utils/generateId.ts";
import { v4 as uuidv4 } from "uuid";
import { generatePDF } from "../utils/generatePDF.ts";

interface IReqData {
  aptId: string;
  doctorId: string;
  patientId: string;
  consultationData: {
    vitals: {
      bloodPressure: string;
      heartRate: number;
      temperature: number;
      weight: number;
      height: number;
    };
    diagnosis: string;
    symptoms: string;
    followUp: {
      duration: string;
      notes: string;
    };
    additionalNotes: string;
    medicines: [
      {
        medicineId: string;
        medicineName: string;
        dosage: string;
        frequency: string;
        duration: string;
        timing: string;
        instructions: string;
      },
    ];
    labTests: [
      {
        testName: string;
        status: string;
        result: string;
        completedAt: Date;
      },
    ];
  };
}

export const createConsultationController = async (req, res) => {
  try {
    const reqData = req.body as IReqData;
    const newCons = new ConsultationModel({
      appointmentId: reqData.aptId,
      doctorId: reqData.doctorId,
      patientId: reqData.patientId,
      vitals: {
        bloodPressure: reqData.consultationData.vitals.bloodPressure,
        heartRate: reqData.consultationData.vitals.heartRate,
        temperature: reqData.consultationData.vitals.temperature,
        weight: reqData.consultationData.vitals.weight,
        height: reqData.consultationData.vitals.height,
      },
      diagnosis: reqData.consultationData.diagnosis,
      symptoms: reqData.consultationData.symptoms,
      followUp: {
        duration: reqData.consultationData.followUp.duration,
        notes: reqData.consultationData.followUp.notes,
      },
      additionalNotes: reqData.consultationData.additionalNotes,
    });

    await newCons.save();

    if (reqData.consultationData?.medicines?.length > 0) {
      const filteredMeds = reqData.consultationData.medicines.filter(
        (med) => med.medicineName && med.medicineName.trim() !== "",
      );

      const PRES_id_no = generateHmsId("PRES", 5);

      if (filteredMeds.length > 0) {
        await PrescriptionModel.create({
          id_no: PRES_id_no,
          consultationId: newCons._id,
          appointmentId: reqData.aptId,
          doctorId: reqData.doctorId,
          patientId: reqData.patientId,
          medicines: filteredMeds,
        });
      }
    }

    if (reqData.consultationData?.labTests?.length > 0) {
      const filteredTests = reqData.consultationData.labTests
        .filter((test) => test.testName && test.testName.trim() !== "")
        .map((test) => ({
          ...test,
          id_no: generateHmsId("LBTST", 5),
        }));
      const LBORD_id_no = generateHmsId("LBORD", 5);

      if (filteredTests.length > 0) {
        await LabOrderModel.create({
          id_no: LBORD_id_no,
          consultationId: newCons._id,
          appointmentId: reqData.aptId,
          doctorId: reqData.doctorId,
          patientId: reqData.patientId,
          tests: filteredTests,
        });
      }
    }

    const apt = await AppointmentModel.findById(reqData.aptId);

    if (!apt) {
      return res
        .status(404)
        .json({ success: true, message: "Appointment not founded" });
    }

    apt.status = "Completed";
    apt.completedAt = Date.now();
    await apt.save();

    const consult = await ConsultationModel.findById(newCons._id)
      .populate("appointmentId", "id_no")
      .populate(
        "doctorId",
        "id_no fullName phoneNo specialization email licenseNo photo",
      )
      .populate(
        "patientId",
        "id_no fullName phoneNo email dob gender phoneNo reasonForVisit",
      );

    const pres = await PrescriptionModel.findOne({
      consultationId: consult?._id,
    });
    const medicines = pres?.medicines ? [...pres.medicines] : [];
    const uniqueFileName = uuidv4();

    const patientDOB = new Date(consult?.patientId?.dob);
    const today = new Date();
    const age = Math.floor(
      (today.getTime() - patientDOB.getTime()) / (365.25 * 24 * 60 * 60 * 1000),
    );

    const pdfFile = await generatePDF(
      "prescription",
      {
        appointment: consult?.appointmentId.id_no,
        patientName: consult?.patientId.fullName,
        patientId: consult?.patientId.id_no,
        patientAge: age,
        patientGender: consult?.patientId.gender || "N/A",
        patientContact: consult?.patientId.phoneNo,
        doctorName: consult?.doctorId.fullName,
        doctorSpecialization: consult?.doctorId.specialization,
        doctorLicense: consult?.doctorId.licenseNo,
        medicines: medicines,
        prescriptionId: pres?.id_no,
        vitalSigns: consult?.vitals,
        diagnosis: consult?.diagnosis,
        symptoms: consult?.symptoms,
        followUp: consult?.followUp,
        additionalNotes: consult?.additionalNotes,
        date: new Date().toLocaleString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }),
      },
      uniqueFileName,
    );

    if (pres && consult) {
      pres.resultPDF = pdfFile;
      consult.resultPDF = pdfFile;
      await pres.save();
      await consult.save();
    }

    return res.status(201).json({
      success: true,
      messsage: "Appointment Completed!",
      apt,
      newCons,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error,
    });
  }
};
