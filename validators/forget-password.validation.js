const joi = require("joi");
const forgetPasswordSchema = joi.object({
  email: joi.string().required(),
});
const resetPasswordSchema = joi.object({
  email: joi.string().required(),
  password: joi.string().required(),
  userOtp: joi.string().required(),
  otp: joi.string().required(),
});
const validateForgetPassword = (req, res, next) => {
  const { error } = forgetPasswordSchema.validate(req.body);
  if (error) {
    const err = new Error(error.details[0].message);
    err.statusCode = 400;
    return next(err);
  }
  next();
};
const validateResetPassword = (req, res, next) => {
  const { error } = resetPasswordSchema.validate(req.body);
  if (error) {
    const err = new Error(error.details[0].message);
    err.statusCode = 400;
    return next(err);
  }
  next();
};

module.exports = { validateForgetPassword, validateResetPassword };