import { io } from "../index.ts";
import DispenseModel from "../models/dispenseModel.ts";
import MedicineModel from "../models/medicineModel.ts";
import NotificationModel from "../models/notificationModel.ts";
import PrescriptionModel from "../models/prescriptionModel.ts";

export const getAllPrescriptionsController = async (req, res) => {
  try {
    const prescriptions = await PrescriptionModel.find()
      .populate("patientId", "id_no fullName phoneNo email")
      .populate("doctorId", "id_no fullName phoneNo email photo")
      .populate("appointmentId", "id_no aptDate")
      .populate("dispensedBy", "id_no fullName phoneNo email")
      .sort({ createdAt: -1 });
    if (prescriptions.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No prescriptions found",
      });
    }
    res.status(200).json({
      success: true,
      message: "Prescriptions fetched successfully",
      prescriptions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error,
    });
  }
};

export const confirmDispensePrescriptionController = async (req, res) => {
  try {
    const { prescriptionId } = req.params;
    const prescription = await PrescriptionModel.findById(prescriptionId)
      .populate("patientId", "id_no fullName phoneNo email")
      .populate("doctorId", "id_no fullName phoneNo email photo")
      .populate("appointmentId", "id_no aptDate");
    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: "Prescription not found",
      });
    }
    prescription.status = "Dispensed";
    prescription.dispensedAt = new Date();
    await prescription.save();
    res.status(200).json({
      success: true,
      message: "Prescription dispensed successfully",
      prescription,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error,
    });
  }
};

export const dispenseMedicineController = async (req, res) => {
  try {
    const { prescriptionId } = req.body;
    const pharmacistId = req.user.pharmacist.id;

    // 1️⃣ Find Prescription
    const prescription = await PrescriptionModel.findById(prescriptionId)
      .populate("medicines.medicineId")
      .populate("patientId", "id_no fullName");

    if (!prescription) {
      return res.status(404).json({
        success: false,
        message: "Prescription not found",
      });
    }

    if (prescription.status === "Dispensed") {
      return res.status(400).json({
        success: false,
        message: "Prescription already dispensed",
      });
    }

    let totalAmount = 0;
    const dispenseMedicines = [];

    // 2️⃣ Check stock, calculate quantity, reduce stock
    for (const item of prescription.medicines) {
      const medicine = await MedicineModel.findById(item.medicineId);
      if (!medicine) {
        return res.status(404).json({
          success: false,
          message: `Medicine not found: ${item.medicineName}`,
        });
      }

      const dosage: number = item.dosage || 0;
      const frequency: number = item.frequency || 0;
      const duration: number = item.duration || 0;
      const tabletStrengthMg: number = medicine.tabletStrengthMg;

      if (!dosage || !frequency || !duration || !tabletStrengthMg) {
        return res.status(400).json({
          success: false,
          message: `Invalid prescription data for ${medicine.name}`,
        });
      }
      const totalTablets = Math.ceil(
        (dosage / tabletStrengthMg) * frequency * duration,
      );
      if (medicine.stockQuantity < totalTablets) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${medicine.name}`,
        });
      }

      // Reduce stock
      medicine.stockQuantity -= totalTablets;
      await medicine.save();

      // Total amount
      const subTotal = totalTablets * medicine.price;
      totalAmount += subTotal;
      // Prepare medicines for dispense record
      dispenseMedicines.push({
        medicineId: medicine._id,
        quantity: totalTablets,
        priceAtTime: medicine.price,
        subTotal,
      });

      // Update prescription item quantity for history
      item.quantity = totalTablets;
    }

    // 3️⃣ Create Dispense Record
    const dispense = await DispenseModel.create({
      prescriptionId: prescription._id,
      pharmacistId,
      medicines: dispenseMedicines,
      totalAmount,
      dispensedAt: new Date(),
    });

    // 4️⃣ Update Prescription Status
    prescription.status = "Dispensed";
    prescription.dispensedBy = pharmacistId;
    prescription.dispensedAt = new Date();
    await prescription.save();

    const patNot = await NotificationModel.create({
      userId: prescription.patientId,
      title: "Prescription Dispensed",
      message: `Your prescription for ${prescription.medicines
        .map((m) => m.medicineName)
        .join(
          ", ",
        )} has been dispensed. Total Amount: Rs. ${totalAmount.toFixed(2)}`,
      notificationType: "prescription",
      prescription: {
        prescriptionId: prescription.id_no,
        status: "Dispensed",
        medicines: prescription.medicines.map((m) => ({
          medicineName: m.medicineName,
          dosage: m.dosage,
          frequency: m.frequency,
          duration: m.duration,
          unit: m.unit || "tablets",
          note: m.instructions,
        })),
        totalAmount: totalAmount,
        resultPDF: prescription?.resultPDF,
        dispensedAt: new Date(),
      },
      createdAt: new Date(),
    });

    const docNot = await NotificationModel.create({
      userId: prescription.doctorId,
      title: "Prescription Dispensed",
      message: `Prescription dispensed for ${prescription.patientId.fullName}.`,
      notificationType: "prescription",
      prescription: {
        prescriptionId: prescription.id_no,
        status: "Dispensed",
        medicines: prescription.medicines.map((m) => ({
          medicineName: m.medicineName,
          dosage: m.dosage,
          frequency: m.frequency,
          duration: m.duration,
          note: m.instructions,
        })),
        totalAmount: totalAmount,
        resultPDF: prescription?.resultPDF,
        dispensedAt: new Date(),
      },
      createdAt: new Date(),
    });

    io.to(`patient_${prescription.patientId._id}`).emit("newNotification", {
      patNot,
    });

    io.to(`doctor_${prescription.doctorId}`).emit("newNotification", {
      docNot,
    });

    io.to(`patient_${prescription.patientId._id}`).emit("notification");

    io.to(`doctor_${prescription.doctorId}`).emit("notification");

    io.to(`patient_${prescription.patientId._id}`).emit(
      "prescriptionDispensed",
      {
        prescription,
      },
    );

    res.status(200).json({
      success: true,
      message: "Medicine dispensed successfully",
      dispense,
      totalAmount,
    });
  } catch (error) {
    console.error("Dispense Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export const getDispenseHistoryController = async (req, res) => {
  try {
    const { pharmacistId } = req.params;

    const dispenseHistory = await DispenseModel.find({ pharmacistId })
      .populate({
        path: "prescriptionId",
        populate: [
          { path: "patientId", select: "id_no fullName phoneNo" },
          { path: "doctorId", select: "id_no fullName" },
          { path: "appointmentId", select: "id_no" },
        ],
      })
      .populate("pharmacistId", "id_no fullName phoneNo email")
      .populate("medicines.medicineId", "name dosage");

    if (!dispenseHistory.length) {
      return res.status(404).json({
        success: false,
        message: "No dispense history found for this prescription",
      });
    }

    res.status(200).json({
      success: true,
      message: "Dispense history fetched successfully",
      dispenseHistory,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error,
    });
  }
};

export const searchMedicineSuggestionsController = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({
        success: false,
        message: "Query parameter is required",
      });
    }
    const regex = new RegExp(query, "i");
    const medicines = await MedicineModel.find({
      name: regex,
    }).select(
      "_id name genericName brand tabletStrengthMg price stockQuantity",
    );
    res.status(200).json({
      success: true,
      message: "Medicine suggestions fetched successfully",
      medicines,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error,
    });
  }
};

export const getPatientAllPrescriptionsController = async (req, res) => {
  try {
    const patientId = req.user.patient.id;
    const prescriptions = await PrescriptionModel.find({
      patientId,
      "hiddenFor.userId": { $ne: patientId },
    })
      .populate("appointmentId", "id_no aptDate appointmentTime")
      .populate("doctorId", "id_no fullName photo specialization")
      .populate("patientId", "id_no fullName email phoneNo")
      .populate("dispensedBy", "id_no fullName")
      .sort({ createdAt: -1 });
    if (prescriptions.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No prescription founded" });
    }
    return res.status(200).json({
      success: true,
      message: "Prescriptions fetched!",
      prescriptions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error,
    });
  }
};

export const markAsSeenPrescriptionsController = async (req, res) => {
  try {
    const userId =
      req.user?.user?.id || req.user?.pharmacist?.id || req.user?.patient?.id;
    await PrescriptionModel.updateMany(
      {
        seenBy: { $ne: userId },
        status: "Dispensed",
      },
      {
        $addToSet: { seenBy: userId },
      },
    );
    return res.status(200).json({
      success: true,
      message: "Prescriptions marked as viewed successfully!",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error,
    });
  }
};

// export const getAllPrescriptionController = async (req, res) => {
//     try {
//         const newPres =
//     } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: "Internal Server Error",
//       error,
//     });
//   }
// }
