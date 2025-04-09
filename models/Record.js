const mongoose = require('mongoose');

const recordSchema = new mongoose.Schema({
  mrnNumber: { type: String, required: true, unique: true }, // MRN Number (Unique Identifier for Patient)
  patientName: { type: String, required: true }, // Patient Name
  cnic: { type: String, required: true }, // Patient Name
  department: { type: String, required: true }, // Department
  doctor: { type: String, required: true }, // Doctor Name
  prescription: { type: String, required: true }, // Prescription Details
  tests: { type: String, required: false }, //  (Optional)
  type: { type: String, required: true, },
  amount: { type: mongoose.Schema.Types.Decimal128, required: true }, // Amount (stored as Decimal128 for accuracy)
  date: { type: Date, required: true },
  attachments: { type: [String], default: [] }, // Array of image paths (Attachments)
});

const Record = mongoose.model("Record", recordSchema);

module.exports = Record;