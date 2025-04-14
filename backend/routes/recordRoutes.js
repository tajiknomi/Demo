const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const Record = require("../models/Record");
const Department = require('../models/Department');
const { verifyToken } = require("../middleware/auth");
const upload = require("../middleware/multerConfig.js");
const validator = require('validator'); // Import validator library
const recordFormValidationSchema = require("../validation/recordValidationSchema.js");
const router = express.Router();

require("dotenv").config();

// POST route to submit record data
router.post("/submitForm", (req, res) => {
  upload.array("attachments", parseInt(process.env.MAX_FILE_UPLOAD_LIMIT))(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      switch (err.code) {
        case 'LIMIT_FILE_SIZE':
          return res.status(400).json({ message: 'File size exceeds the limit!' });
        case 'LIMIT_UNEXPECTED_FILE':
          return res.status(400).json({ 
            message: `You can upload a maximum of ${process.env.MAX_FILE_UPLOAD_LIMIT} files.` 
          });
        default:
          return res.status(400).json({ message: err.message });
      }
    } else if (err) {
      return res.status(500).json({ message: err.message });
    }
    
    // Now multer passed successfully — move to your original logic
    try {
      const { error, value } = await recordFormValidationSchema.validate(req.body);
      if (error) {
        // Cleanup uploaded files (as the submission is failed)
        if (req.files) {
          req.files.forEach(file => fs.unlinkSync(file.path));
        }
        return res.status(400).json({ message: error.details[0].message }); // send specific error message to client
        //return res.status(400).json({ message: "Bad Request" }); // send a generic error message to client without sharing the internal details
      }

      const attachmentPaths = req.files ? req.files.map(file => `/uploads/${req.body.cnic}/${file.filename}`) : [];
      const { attachments, ...recordData } = { ...req.body, attachments: attachmentPaths };

      // Convert string fields to lowercase
      for (let key in recordData) {
        if (typeof recordData[key] === 'string') {
          recordData[key] = recordData[key].toLowerCase();
        }
      }

      // Check for existing MRN
      const existingRecord = await Record.findOne({ mrnNumber: recordData.mrnNumber });
      if (existingRecord) {
        // Cleanup uploaded files (as the submission is failed)
        if (req.files) {
          req.files.forEach(file => fs.unlinkSync(file.path));
        }
        return res.status(400).json({ message: "MRN Number already exists" });
      }

      // Save the record
      const record = new Record({ ...recordData, attachments: attachmentPaths });
      await record.save();
      // Update collectedAmount in the corresponding department collection
      const { department, amount } = recordData;
      await Department.findOneAndUpdate(
        { name: department },
        { $inc: { collectedAmount: parseFloat(amount) } }
      );
      res.status(201).json({ message: "Form submission successful!" });

    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "There was an error submitting the form" });
    }
  });
});

// GET record by MRN
router.post('/view', async (req, res) => {
  try {
    // First validate the mrnNumber
    const { error, value } = await recordFormValidationSchema.extract('mrnNumber').validate(req.body.mrnNumber);
    if (error) {
      return res.status(400).json({ message: 'Invalid MRN Number' });
    }
    // extract mrnNumber from request
    const { mrnNumber } = req.body;
    if (!mrnNumber) {
      return res.status(400).json({ message: 'MRN number is required' });
    }
    // Find the record in db
    const record = await Record.findOne({ mrnNumber });
    if (!record) {
      return res.status(404).json({ message: 'Record not found' });
    }
    // Convert Decimal128 to string
    const amountStr = record.amount.toString();
    // Prepare attachment links
    const attachments = record.attachments.map((file, index) => ({
      name: `${index + 1}`,
      url: `/file/${record.cnic}/${path.basename(file)}`
    }));

    // Build response object
    const recordResponse = {
      mrnNumber: record.mrnNumber,
      patientName: record.patientName,
      cnic: record.cnic,
      department: record.department,
      doctor: record.doctor,
      prescription: record.prescription,
      tests: record.tests,
      type: record.type,
      amount: amountStr,
      date: record.date,
      attachments,
    };

    return res.json({ record: recordResponse });
  } catch (error) {
    console.error('Error in /view-record:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Protected route to serve uploaded files
router.get('/file/:folder/:filename', (req, res) => {
  const { folder, filename } = req.params;
  const filePath = path.join(__dirname, '../uploads', folder, filename);
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).json({ message: 'File not found' });
  }
});

module.exports = router;