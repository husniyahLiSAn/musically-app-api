const Joi = require('joi');

const UserPayloadSchema = Joi.object({
  username: Joi.string().max(26).required(),
  password: Joi.string().max(16).required(),
  fullname: Joi.string().required(),
});

module.exports = { UserPayloadSchema };
