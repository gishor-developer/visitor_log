const Joi = require('joi');

// Joi schema for user registration
const registerSchema = Joi.object({
  name: Joi.string().min(3).max(30).required(),
  username: Joi.string().required(),
  password: Joi.string().min(6).required()
});

// Joi schema for user login
const tokenSchema = Joi.object({
  grant_type: Joi.string().required()
});

module.exports = {
  registerSchema, tokenSchema
}