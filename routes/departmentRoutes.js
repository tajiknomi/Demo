const express = require("express");
const router = express.Router();
const Department = require('../models/Department');
const Record = require('../models/Record');
const departmentValidationSchema = require('../validation/departmentValidation');

// Route to add a new department
router.post('/share', async (req, res) => {
  try {
    const { error } = departmentValidationSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    let { name, sharePercentage } = req.body;
    name = name.trim().toLowerCase(); // Normalize name to lowercase
    const existingDepartment = await Department.findOne({ name });

    // Check if the share percentage is valid before proceeding
    const departments = await Department.find({ name: { $ne: name } });
    const totalExistingPercentage = departments.reduce((sum, dept) => sum + dept.sharePercentage, 0);
    if (totalExistingPercentage + sharePercentage > 100) {
      return res.status(400).json({
        message: "Total share percentage exceeds 100%. Please reduce the percentage from other department(s) to accommodate this one.",
      });
    }

    if (existingDepartment) {
      existingDepartment.sharePercentage = sharePercentage;
      await existingDepartment.save();
      return res.status(200).json({ message: "Department updated successfully." });
    } else {

      // Aggregate the sum of amounts for this department in Record collection
      const recordSum = await Record.aggregate([
        { $match: { department: name } },
        { $group: { _id: null, total: { $sum: { $toDouble: "$amount" } } } }
      ]);
 //     console.log("Record aggregation result:", recordSum);
      const collectedAmount = recordSum.length > 0 ? recordSum[0]?.total : 0.0;
      const department = new Department({
        name,
        collectedAmount,
        sharePercentage
      });

      await department.save();
      return res.status(201).json({ message: "Department added successfully." });
    }
  } catch (err) {
    console.error(err);  // Log the error for debugging purposes
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

router.post('/bulk-share', async (req, res) => {
  try {
    const departmentsInput = req.body;

    // Total percentage after adding new ones
    const existingDepartments = await Department.find();
    const existingPercentage = existingDepartments.reduce((sum, dept) => sum + dept.sharePercentage, 0);

    const newPercentage = departmentsInput.reduce((sum, dept) => sum + dept.sharePercentage, 0);
    if (existingPercentage + newPercentage > 100) {
      return res.status(400).json({
        message: "Total share percentage exceeds 100%. Please adjust other department percentages to fit within the limit.",
      });
    }

    const departmentPromises = departmentsInput.map(async (departmentData) => {
      const { name, sharePercentage } = departmentData;
      const existing = await Department.findOne({ name: name.toLowerCase().trim() });

      if (existing) {
        existing.sharePercentage = sharePercentage;
        return existing.save();
      } else {
        // Get collectedAmount from records
        const recordSum = await Record.aggregate([
          { $match: { department: name.toLowerCase() } },
          { $group: { _id: null, total: { $sum: { $toDouble: "$amount" } } } }
        ]);
        const collectedAmount = recordSum[0]?.total || 0.0;

        const department = new Department({
          name,
          collectedAmount,
          sharePercentage
        });

        return department.save();
      }
    });

    await Promise.all(departmentPromises);

    res.status(201).json({ message: "Departments processed successfully." });
  } catch (err) {
    res.status(500).json({ message: "Error processing departments", error: err.message });
  }
});

router.get('/executive-summary', async (req, res) => {
  try {
    const departments = await Department.find();

    if (departments.length === 0) {
      return res.status(404).json({ message: 'No departments found' });
    }

    // Calculate the total amount collected
    const totalCollected = departments.reduce((sum, dept) => sum + dept.collectedAmount, 0);

    // Calculate share amounts and total distributed amount
    let totalDistributed = 0;

    const departmentShares = departments.map(dept => {
      const shareAmount = (totalCollected * dept.sharePercentage) / 100;
      totalDistributed += shareAmount;
      return {
        name: dept.name,
        collectedAmount: dept.collectedAmount,
        sharePercentage: dept.sharePercentage,
        shareAmount: parseFloat(shareAmount.toFixed(2))
      };
    });

    const remainingAmount = parseFloat((totalCollected - totalDistributed).toFixed(2));

    res.json({
      totalCollected: parseFloat(totalCollected.toFixed(2)),
      remainingAmount,
      departments: departmentShares
    });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});


module.exports = router;