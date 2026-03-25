import MedicineModel from "../models/medicineModel.ts";

export const getInventoryMedicinesController = async (req, res) => {
  try {
    const medicines = await MedicineModel.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      message: "Medicines fetched successfully",
      inventory: medicines,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error,
    });
  }
};

export const addMedicineToInventoryController = async (req, res) => {
  try {
    const {
      name,
      genericName,
      brand,
      batchNumber,
      expiryDate,
      price,
      stockQuantity,
      description,
      tabletStrengthMg,
    } = req.body;
    const newMedicine = new MedicineModel({
      name,
      genericName,
      brand,
      batchNumber,
      expiryDate,
      price,
      stockQuantity,
      description,
      tabletStrengthMg,
    });
    await newMedicine.save();
    res.status(201).json({
      success: true,
      message: "Medicine added successfully",
      medicine: newMedicine,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error,
    });
  }
};

export const updateMedicineInfoController = async (req, res) => {
  try {
    const { medicineId } = req.params;
    const updateData = req.body;
    const updatedMedicine = await MedicineModel.findByIdAndUpdate(
      medicineId,
      updateData,
      { new: true },
    );
    res.status(200).json({
      success: true,
      message: "Medicine updated successfully",
      medicine: updatedMedicine,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error,
    });
  }
};

export const deleteMedicineFromInventoryController = async (req, res) => {
  try {
    const { medicineId } = req.params;
    await MedicineModel.findByIdAndDelete(medicineId);
    res.status(200).json({
      success: true,
      message: "Medicine deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error,
    });
  }
};
