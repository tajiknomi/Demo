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

  sharePercentage: Joi.number()
    .precision(3)
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
