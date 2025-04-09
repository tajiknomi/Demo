const mongoose = require('mongoose');
//require('@mongoosejs/double')(mongoose); // ensure this is loaded before schema

const departmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  collectedAmount: {
    type: mongoose.Schema.Types.Double,
    required: true,
    default: 0.0,
  },
  sharePercentage: {
    type: Number, // floats are allowed with Number type
    required: true,
    min: 0,
    max: 100,
  },
});

const Department = mongoose.model('Department', departmentSchema);

module.exports = Department;