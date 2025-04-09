const Joi = require('joi');

const userValidationSchema = Joi.object({
  username: Joi.string()
    .min(4)
    .max(30)
    .required()
    .messages({
      'string.min': '"Username" should be at least 4 characters long',
      'string.max': '"Username" should not exceed 30 characters'
    }),

  password: Joi.string()
    .min(6) 
    .required()
    .messages({
      'string.min': '"Password" should be at least 6 characters long',
    }),

  role: Joi.string()
    .valid('operator', 'admin')
    .required()
    .messages({
      'any.only': '"Role" is Invalid'
    })
});

module.exports = userValidationSchema;
