const Joi = require("joi");

const signupSchema = Joi.object({
  firstName: Joi.string().min(3).max(100).required(),
  lastName: Joi.string().min(3).max(100).required(),
  email: Joi.string().email().max(255).required(),
  gender: Joi.number().required(),

  // Optional fields
  phonenumber: Joi.string().optional(),
  city: Joi.string().optional(),
  street: Joi.string().optional(),
  address: Joi.string().optional(),
  image: Joi.string().uri().optional(),

  // Required password with strong pattern
  password: Joi.string()
    .pattern(
      new RegExp(
        "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$"
      )
    )
    .required()
    .messages({
      "string.pattern.base":
        "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.",
    }),
});

const validateSignup = (req, res, next) => {
  const { error } = signupSchema.validate(req.body);
  if (error) {
    const err = new Error(error.details[0].message);
    err.statusCode = 400;
    return next(err);
  }
  next();
};

module.exports = { validateSignup };
