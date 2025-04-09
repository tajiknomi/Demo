const express = require("express");
const router = express.Router();
const Department = require('../models/Department');
const departmentValidationSchema = require('../validation/departmentValidation');

// Route to add a new department
router.post('/share', async (req, res) => {
  try {
    // Validate input data
    const { error } = departmentValidationSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { name, sharePercentage, collectedAmount } = req.body;

    // Fetch all departments except the one being updated/inserted
    const otherDepartments = await Department.find({ name: { $ne: name } });

    // Calculate total percentage with new entry included
    const currentTotal = otherDepartments.reduce((sum, dept) => sum + dept.sharePercentage, 0);
    const newTotal = currentTotal + sharePercentage;

    if (newTotal > 100) {
      return res.status(400).json({
        message: "The total share percentage exceeds 100%",
        hint: "Please reduce the share percentage of one or more existing departments to accommodate this update."
      });
    }

    // Upsert the department
    await Department.findOneAndUpdate(
      { name },
      { $set: { sharePercentage, collectedAmount } },
      { upsert: true, new: true, runValidators: true }
    );

    res.status(200).json({ message: 'Department updated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});



router.post('/bulk-share', async (req, res) => {
  try {
    const departments = req.body; // Expecting an array of departments

    // Step 1: Validate total percentage
    const totalPercentage = departments.reduce((sum, dept) => sum + dept.sharePercentage, 0);

    if (totalPercentage > 100) {
      return res.status(400).json({
        message: 'The combined share percentage of all departments cannot exceed 100%',
        totalSubmittedPercentage: totalPercentage
      });
    }

    // Step 2: Upsert each department (create if not exists, update otherwise)
    const departmentPromises = departments.map(dept =>
      Department.findOneAndUpdate(
        { name: dept.name },
        { $set: dept },
        { upsert: true, new: true, runValidators: true }
      )
    );

    await Promise.all(departmentPromises);
    res.status(200).json({ message: 'Departments updated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error updating departments', error: err.message });
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