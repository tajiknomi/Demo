const Joi = require('joi');

const recordValidationSchema = Joi.object({
  mrnNumber: Joi.string()
    .required()
    .messages({
      'any.required': '"MRN Number" is required',
      'string.base': '"MRN Number" must be a string',
    }),

  patientName: Joi.string()
    .pattern(/^[A-Za-z\s]+$/)
    .required()
    .messages({
      'string.pattern.base': '"Patient Name" is invalid, only letters and spaces are allowed',
    }),

    cnic: Joi.string()
    .pattern(/^\d{5}-\d{7}-\d{1}$/)
    .required()
    .messages({
      'string.pattern.base': 'CNIC must be in the format xxxxx-xxxxxxx-x (e.g., 12345-1234567-1)'
    }),

  department: Joi.string()
    .lowercase()
    .pattern(/^[A-Za-z\s]+$/)
    .required()
    .messages({
      'string.pattern.base': '"Department" is invalid, only letters and spaces are allowed',
    }),

  doctor: Joi.string()
    .lowercase()
    .pattern(/^[A-Za-z\s]+$/)
    .required()
    .messages({
      'string.pattern.base': '"Doctor" is invalid, only letters and spaces are allowed',
    }),

  prescription: Joi.string()
    .required()
    .messages({
      'string.base': '"Prescription" is required and must be a string',
    }),

  tests: Joi.string()
    .allow('')
    .optional()
    .messages({
      'array.base': '"Tests" must be strings',
    }),

  type: Joi.string()
    .valid('General', 'SSP')
    .required()
    .messages({
      'any.only': '"Type" must be either "General" or "SSP"',
    }),

  amount: Joi.number()
    .precision(2)
    .positive()
    .required()
    .messages({
      'number.base': '"Amount" must be a number',
      'number.positive': '"Amount" must be a positive number',
      'any.required': '"Amount" is required',
    }),

    date: Joi.date()
    .required()
    .messages({
      'any.required': '"Date" is invalid'
    }),

  attachments: Joi.array()
    .items(Joi.string())
    .default([])
    .messages({
      'array.base': '"Attachments" must be an array of strings',
    }),
});

module.exports = recordValidationSchema;
