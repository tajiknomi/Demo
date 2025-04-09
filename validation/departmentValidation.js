const Joi = require('joi');

const departmentValidationSchema = Joi.object({
  name: Joi.string()
    .pattern(/^[A-Za-z\s]+$/)
    .trim()
    .lowercase()
    .required()
    .messages({
      'string.pattern.base': '"Department Name" is invalid, only letters and spaces are allowed',
      'any.required': '"Department Name" is required',
    }),

  collectedAmount: Joi.number()
    .precision(2)
    .min(0)
    .required()
    .messages({
      'number.base': '"Collected Amount" must be a number',
      'number.min': '"Collected Amount" must be zero or more',
      'any.required': '"Collected Amount" is required',
    }),

  sharePercentage: Joi.number()
    .precision(3) // allow floats like 33.33
    .min(0)
    .max(100)
    .required()
    .messages({
      'number.base': '"Share Percentage" must be a number',
      'number.min': '"Share Percentage" cannot be less than 0',
      'number.max': '"Share Percentage" cannot be more than 100',
      'any.required': '"Share Percentage" is required',
    }),
});

module.exports = departmentValidationSchema;
