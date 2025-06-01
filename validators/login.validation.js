// validation/login.validation.js
const Joi = require("joi");

const loginSchema = Joi.object({
  email: Joi.string().email().max(255).required(),
  password: Joi.string()
    .pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$"))
    .required()
    .messages({
      "string.pattern.base":
        "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.",
    }),
});

const validateLogin = (req, res, next) => {
  const { error } = loginSchema.validate(req.body);
  if (error) {
    const err = new Error(error.details[0].message);
    err.statusCode = 400;
    return next(err);
  }
  next();
};

module.exports = { validateLogin };
