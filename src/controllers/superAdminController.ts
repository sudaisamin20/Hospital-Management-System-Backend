import UserModel from "../models/userModel.ts";
import DepartmentModel from "../models/departmentModel.ts";
import SpecialistModel from "../models/specialistModel.ts";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import LabDepartmentModel from "../models/labDepartments.ts";

const JWT_SECRET: string = process.env.JWT_SECRET || "defaultsecret";

export const loginSuperAdminController = async (req, res) => {
  try {
    const { id_no, email, password, role } = req.body;
    const superAdmin = await UserModel.findOne({ id_no, email });
    if (!superAdmin) {
      return res
        .status(404)
        .json({ success: false, message: "Invalid credentials!" });
    }
    if (superAdmin.role !== role) {
      return res
        .status(400)
        .json({ success: true, message: "Selected wrong role!" });
    }

    const isPasswordValid = await bcrypt.compare(password, superAdmin.password);
    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const payload = {
      superAdmin: {
        id: superAdmin._id,
        id_no: superAdmin.id_no,
        email: superAdmin.email,
        role: superAdmin.role,
      },
    };

    const token = jwt.sign(payload, JWT_SECRET);

    return res.status(200).json({
      success: true,
      message: "Super Admin login successfully",
      superAdmin: {
        id: superAdmin._id,
        id_no: superAdmin.id_no,
        email: superAdmin.email,
        role: superAdmin.role,
      },
      token,
    });
  } catch (error) {
    res
      .status(505)
      .json({ success: false, message: "internal server error", error });
  }
};

export const fetchStaffDataController = async (req, res): Promise<void> => {
  try {
    const staffData = await UserModel.find({
      role: { $ne: "superadmin" },
    })
      .select("-password")
      .sort({ createdAt: -1 });
    return res
      .status(200)
      .json({ success: true, message: "Data fetched successfully", staffData });
  } catch (error) {
    res.status(505).json({ success: false, message: "internal server error" });
  }
};

interface IStaffMemberDataType {
  id_no: string;
  fullName: string;
  role: string;
  email: string;
  phoneNo: string;
  department: string;
  licenseNo: string;
  specialization: string;
  doj: string;
  dob: string;
  salary: string;
  qualification: string;
  maritalStatus: string;
  specialistId: string;
  departmentId: string;
  emergencyNo: string;
  address: string;
  photo: string;
  password: string;
  yearsOfExperience: number;
  qualifications: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const updateStaffMemberProfileController = async (
  req,
  res,
): Promise<void> => {
  try {
    const staffMemberData = req.body as IStaffMemberDataType;
    const photo = req.file?.filename;
    const { id } = req.params;

    const staffMember = await UserModel.findOne({
      _id: id,
    });

    if (!staffMember) {
      return res.status(404).json({
        success: false,
        message: "Staff member not found",
      });
    }

    if (staffMemberData.fullName)
      staffMember.fullName = staffMemberData.fullName;

    if (staffMemberData.role) staffMember.role = staffMemberData.role;

    if (staffMemberData.id_no) staffMember.id_no = staffMemberData.id_no;

    if (staffMemberData.email) staffMember.email = staffMemberData.email;

    if (staffMemberData.phoneNo) staffMember.phoneNo = staffMemberData.phoneNo;

    if (staffMemberData.address) staffMember.address = staffMemberData.address;

    if (staffMemberData.salary) staffMember.salary = staffMemberData.salary;

    if (staffMemberData.specialization)
      staffMember.specialization = staffMemberData.specialization;

    if (staffMemberData.licenseNo)
      staffMember.licenseNo = staffMemberData.licenseNo;

    if (staffMemberData.departmentId)
      staffMember.departmentId = staffMemberData.departmentId;

    if (staffMemberData.emergencyNo)
      staffMember.emergencyNo = staffMemberData.emergencyNo;

    if (staffMemberData.doj) staffMember.doj = staffMemberData.doj;

    if (staffMemberData.dob) staffMember.dob = staffMemberData.dob;

    if (staffMemberData.qualification)
      staffMember.qualification = staffMemberData.qualification;

    if (staffMemberData.maritalStatus)
      staffMember.maritalStatus = staffMemberData.maritalStatus;

    if (staffMemberData.yearsOfExperience)
      staffMember.yearsOfExperience = staffMemberData.yearsOfExperience;

    if (staffMemberData.specialistId)
      staffMember.specialistId = staffMemberData.specialistId;

    if (photo) {
      staffMember.photo = photo;
    } else if (staffMember.photo) {
      staffMember.photo = staffMember.photo;
    }

    staffMember.updatedAt = new Date();

    const updatedStaff = await staffMember.save();

    return res.status(200).json({
      success: true,
      message: `${updatedStaff?.role.charAt(0).toUpperCase() + updatedStaff?.role.slice(1)}'s profile updated successfully`,
      updatedStaff,
    });
  } catch (error) {
    console.error("Update error:", error);
    res.status(505).json({
      success: false,
      message: "Internal Server Error",
      error,
    });
  }
};

interface IRequestBody {
  name: string;
}

export const createDepartmentController = async (req, res) => {
  try {
    const { name } = req.body as IRequestBody;

    const department = await DepartmentModel.findOne({ name });

    if (department?.name.toLowerCase() === name.toLowerCase()) {
      return res
        .status(409)
        .json({ success: true, message: "Department already exist!" });
    }

    const newDepartment = new DepartmentModel({ name });
    await newDepartment.save();
    return res.json({
      success: true,
      message: "Department created successfully",
      newDepartment,
    });
  } catch (error) {
    res.status(505).json({
      success: false,
      message: "Internal Server Error",
      error,
    });
  }
};

export const fetchDepartmentsController = async (req, res) => {
  try {
    const departments = await DepartmentModel.find();
    if (departments.length === 0) {
      return res
        .status(404)
        .json({ success: true, message: "No department found!" });
    }
    return res.status(200).json({
      success: true,
      message: "Fetch department successfully",
      departments,
    });
  } catch (error) {
    res.status(505).json({
      success: false,
      message: "Internal Server Error",
      error,
    });
  }
};

export const fetchSpecialistsController = async (req, res) => {
  try {
    const { id } = req.params;
    const specialists = await SpecialistModel.find({ departmentId: id });
    if (specialists.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No specialist data found" });
    }
    return res.status(200).json({
      success: true,
      message: "Fetch data successfully!",
      specialists,
    });
  } catch (error) {
    res.status(505).json({
      success: false,
      message: "Internal Server Error",
      error,
    });
  }
};

export const fetchLabAssDepts = async (req, res) => {
  try {
    const labAssDepts = await LabDepartmentModel.find();
    return res.status(200).json({
      success: true,
      message: "Lab departments fetched!",
      labAssDepts,
    });
  } catch (error) {
    res.status(505).json({
      success: false,
      message: "Internal Server Error",
      error,
    });
  }
};
