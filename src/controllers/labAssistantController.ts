import bcrypt from "bcryptjs";
import { generateHmsId } from "../utils/generateId.ts";
import jwt from "jsonwebtoken";
import LabAssistantModel from "../models/labAssistantModel.ts";
import LabOrderModel from "../models/labOrderModel.ts";
import TestModel from "../models/testModel.ts";
import NotificationModel from "../models/notificationModel.ts";
import { generatePDF } from "../utils/generatePDF.ts";
import { v4 as uuidv4 } from "uuid";
import { io } from "../index.ts";

const JWT_SECRET: string = process.env.JWT_SECRET || "defaultsecret";

interface LabAssistantData {
  id_no: string;
  fullName: string;
  email: string;
  password: string;
  phoneNo: string;
  role: string;
  departmentId: string;
  isActive: boolean;
  qualification: string;
  emergencyNo: string;
  salary: string;
  maritalStatus: string;
  photo: string;
  doj: string;
  dob: string;
  address: string;
  createdAt: Date;
  updatedAt: Date;
}

export const registerLabAssistantController = async (req, res) => {
  try {
    const labAssistantData = req.body as LabAssistantData;
    const photo: string = req.file.filename;
    const existingLabAssistant = await LabAssistantModel.findOne({
      email: labAssistantData.email,
    });

    if (existingLabAssistant) {
      return res.status(400).json({
        success: false,
        message: `User with this email already exist on ${existingLabAssistant.role} Role`,
      });
    }

    const hashedPassword = await bcrypt.hash(labAssistantData.password, 10);
    const id_no = generateHmsId("LASSIST", 5);

    const newLabAssistant = new LabAssistantModel({
      ...labAssistantData,
      id_no,
      password: hashedPassword,
      photo,
      isActive: true,
      departmentId: "Radiology",
    });
    await newLabAssistant.save();

    const payload = {
      labAssistant: {
        id: newLabAssistant._id,
        fullName: newLabAssistant.fullName,
        email: newLabAssistant.email,
        phoneNo: newLabAssistant.phoneNo,
        role: newLabAssistant.role,
        departmentId: newLabAssistant.departmentId,
      },
    };
    const token = jwt.sign(payload, JWT_SECRET);
    res.status(201).json({
      success: true,
      message: "Lab Assistant registered successfully",
      labAssistant: {
        id: newLabAssistant._id,
        id_no: newLabAssistant.id_no,
        fullName: newLabAssistant.fullName,
        email: newLabAssistant.email,
        phoneNo: newLabAssistant.phoneNo,
        departmentId: newLabAssistant.departmentId,
        role: newLabAssistant.role,
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

export const loginLabAssistantController = async (req, res) => {
  try {
    const { id_no, email, password, role } = req.body;

    const labAssistant = await LabAssistantModel.findOne({ id_no, email });

    if (!labAssistant) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });
    }
    if (labAssistant.role !== role) {
      return res.status(400).json({
        success: false,
        message: `Selected wrong role! Please select the Lab Assistant role in the options.`,
      });
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      labAssistant.password,
    );

    if (!isPasswordValid) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });
    }

    const payload = {
      labAssistant: {
        id: labAssistant._id,
        fullName: labAssistant.fullName,
        email: labAssistant.email,
        phoneNo: labAssistant.phoneNo,
        role: labAssistant.role,
        departmentId: labAssistant.departmentId,
      },
    };

    const token = jwt.sign(payload, JWT_SECRET);

    res.status(200).json({
      success: true,
      message: "Lab Assistant logged in successfully",
      user: {
        id: labAssistant._id,
        id_no: labAssistant.id_no,
        fullName: labAssistant.fullName,
        email: labAssistant.email,
        phoneNo: labAssistant.phoneNo,
        role: labAssistant.role,
        departmentId: labAssistant.departmentId,
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

export const fetchLabOrdersByDepartment = async (req, res) => {
  try {
    const { departmentId } = req.params;

    const deptTests = await TestModel.find({ departmentId }).select("_id");
    const deptTestIds = deptTests.map((t) => t._id);

    const orders = await LabOrderModel.find({
      "tests.testId": { $in: deptTestIds },
    })
      .populate("patientId", "id_no fullName phoneNo email dob gender")
      .populate("doctorId", "id_no fullName phoneNo email photo")
      .populate("appointmentId", "id_no")
      .populate("tests.testId", "_id id_no departmentId name")
      .sort({ createdAt: -1 });

    const labTests = orders.map((order) => {
      const o = order.toObject();
      o.tests = o.tests.filter((t) =>
        deptTestIds.some((id) => id.equals(t.testId._id)),
      );
      return o;
    });
    res.status(200).json({
      success: true,
      message: "Lab orders fetched successfully",
      labTests,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error,
    });
  }
};

export const searchLabtestSuggestionsController = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({
        success: false,
        message: "Query parameter is required",
      });
    }
    const regex = new RegExp(query, "i");
    const labTests = await TestModel.find({
      name: regex,
    }).select(
      "_id name departmentId price sampleType description normalRange reportType",
    );
    res.status(200).json({
      success: true,
      message: "Lab test suggestions fetched successfully",
      labTests,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error,
    });
  }
};

export const startTestController = async (req, res) => {
  try {
    const { labTestId, testId, status } = req.body;

    const labOrder = await LabOrderModel.findById(labTestId);

    if (!labOrder) {
      return res.status(404).json({
        success: false,
        message: "Lab order not found",
      });
    }

    const test = labOrder.tests.find((t) => {
      if (t.testId._id) {
        return t.testId._id.equals(testId);
      }
      return t.testId.equals(testId);
    });

    if (!test) {
      return res.status(404).json({
        success: false,
        message: "Test not found in order",
      });
    }

    test.status = status;
    await labOrder.save();

    const patNot = await NotificationModel.create({
      userId: labOrder.patientId,
      title: "Lab Test Started",
      message: `Your lab test "${test.testName}" has started. Test ID: ${test.id_no}. Please wait for the results.`,
      notificationType: "lab_test",
      labOrder: {
        labOrderId: labOrder._id,
        testName: test.testName,
        testId: test.id_no,
        status: test.status,
      },
      createdAt: new Date(),
    });

    io.to(`patient_${labOrder.patientId}`).emit("notification");

    io.to(`patient_${labOrder.patientId}`).emit("newNotification", {
      patNot,
    });

    io.to(`patient_${labOrder.patientId}`).emit("labTestStart", {
      test,
    });

    res.status(200).json({
      success: true,
      message: "Test started successfully",
      labOrder,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error,
    });
  }
};

export const submitTestResultController = async (req, res) => {
  console.log(req.body);
  try {
    const { labTestId, testId, results, remarks, status } = req.body;

    // Get the logged-in lab assistant from token/session
    // For now, we'll use a placeholder - in production, get from auth middleware
    const labAssistantId = req.user.labAssistant.id;

    const labOrder = await LabOrderModel.findById(labTestId)
      .populate("patientId", "_id fullName id_no email dob gender")
      .populate("doctorId", "_id fullName id_no email")
      .populate("tests.testId", "_id name departmentId");

    if (!labOrder) {
      return res.status(404).json({
        success: false,
        message: "Lab order not found",
      });
    }

    const test = labOrder.tests.find((t) => {
      if (t.testId._id) {
        return t.testId._id.equals(testId);
      }
      return t.testId.equals(testId);
    });

    if (!test) {
      return res.status(404).json({
        success: false,
        message: "Test not found in order",
      });
    }

    test.status = status;
    test.results = results;
    test.remarks = remarks;
    test.completedAt = new Date();

    // Calculate patient age
    const patientDOB = new Date(labOrder.patientId.dob);
    const today = new Date();
    const age = Math.floor(
      (today.getTime() - patientDOB.getTime()) / (365.25 * 24 * 60 * 60 * 1000),
    );

    // Try to get lab assistant info if available
    let technicianName = "Lab Technician";
    let technicianLicense = "LT-2024-00001";

    if (labAssistantId) {
      try {
        const labAssistant = await LabAssistantModel.findById(
          labAssistantId,
        ).select("fullName id_no qualification licenseNo");
        console.log(labAssistant?.licenseNo);
        if (labAssistant) {
          technicianName = labAssistant.fullName;
          technicianLicense = labAssistant.licenseNo || "LT-2024-00001";
        }
      } catch (error) {
        console.log(
          "Could not fetch lab assistant info, using defaults",
          error,
        );
      }
    }

    const uniqueFileName = uuidv4();

    // Generate PDF with proper data
    const pdfFile = await generatePDF(
      "labReport",
      {
        patientName: labOrder.patientId.fullName,
        patientId: labOrder.patientId.id_no,
        age: age,
        gender: labOrder.patientId.gender || "N/A",
        doctorName: labOrder.doctorId.fullName,
        testName: test.testName,
        date: new Date().toLocaleString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }),
        testResults: results,
        remarks: remarks || "No additional remarks.",
        technicianName: technicianName,
        technicianLicense: technicianLicense,
        reportId: test.id_no,
      },
      uniqueFileName,
    );

    test.resultPDF = pdfFile;

    await labOrder.save();

    // Create notification for patient with complete lab test details
    const patNot = await NotificationModel.create({
      userId: labOrder.patientId._id,
      title: "Lab Test Completed",
      message: `Your ${test.testName} test report is ready. ID: ${test.id_no}`,
      notificationType: "lab_test",
      labOrder: {
        labOrderId: labOrder._id,
        testName: test.testName,
        testId: test.id_no,
        status: test.status,
        results: test.results,
        remarks: test.remarks,
        resultPDF: test.resultPDF,
        completedAt: test.completedAt,
      },
      createdAt: new Date(),
    });

    io.to(`patient_${labOrder.patientId._id}`).emit("notification");
    io.to(`patient_${labOrder.patientId._id}`).emit("newNotification", {
      patNot,
    });
    io.to(`patient_${labOrder.patientId._id}`).emit("labTestResultSubmit", {
      test,
    });

    const docNot = await NotificationModel.create({
      userId: labOrder.doctorId._id,
      title: "Lab Test Completed",
      message: `Lab test completed for ${labOrder.patientId.fullName}. The test is ${test.testName} and Test ID is ${test.id_no}`,
      notificationType: "lab_test",
      labOrder: {
        labOrderId: labOrder._id,
        testName: test.testName,
        testId: test.id_no,
        status: test.status,
        results: test.results,
        remarks: test.remarks,
        resultPDF: test.resultPDF,
        completedAt: test.completedAt,
      },
      createdAt: new Date(),
    });

    io.to(`patient_${labOrder.doctorId._id}`).emit("notification");

    io.to(`patient_${labOrder.doctorId._id}`).emit("newNotification", {
      docNot,
    });

    res.status(200).json({
      success: true,
      message: "Test result submitted successfully",
      labOrder,
    });
  } catch (error) {
    console.error("Error in submitTestResultController:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const fetchPatientAllTestReportsController = async (req, res) => {
  try {
    const patientId = req.user.patient.id;
    const labReports = await LabOrderModel.find({
      patientId,
      "hiddenFor.userId": { $ne: patientId },
    })
      .populate("appointmentId", "id_no aptDate appointmentTime")
      .populate("doctorId", "fullName id_no photo specialization")
      .populate("patientId", "email phoneNo fullName id_no")
      .sort({ createdAt: -1 });
    if (labReports.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No lab report founded!" });
    }
    return res
      .status(200)
      .json({ success: true, message: "Lab reports fetched!", labReports });
  } catch (error) {
    console.error("Error in submitTestResultController:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const deleteLabOrderController = async (req, res) => {
  try {
    const { labOrderId, role, userId } = req.body;
    const labOrder = await LabOrderModel.findByIdAndUpdate(labOrderId);
    const penOrProOrder = labOrder?.tests.some((t) => t.status !== "Completed");
    if (penOrProOrder) {
      return res.status(400).json({
        success: false,
        message: "Cannot deleted. Some test reports are not completed yet.",
      });
    }

    labOrder?.hiddenFor.push({
      userId,
      role,
      hiddenAt: Date.now(),
    });
    await labOrder?.save();
    return res.status(201).json({
      success: true,
      message: "Lab order deleted successfully",
      labOrder,
    });
  } catch (error) {
    console.error("Error in submitTestResultController:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const markAsSeenLabOrdersController = async (req, res) => {
  try {
    const userId =
      req.user?.user?.id || req.user?.labAssistant?.id || req.user?.patient?.id;
    await LabOrderModel.updateMany(
      {
        seenBy: { $ne: userId },
        "tests.status": "Completed",
      },
      {
        $addToSet: { seenBy: userId },
      },
    );
    return res.status(200).json({
      success: true,
      message: "Lab orders marked as viewed successfully!",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error,
    });
  }
};
