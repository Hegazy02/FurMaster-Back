const joi = require("joi");
const paymentMethodSchema = joi.object({
  userId: joi.string().required(),
  provider: joi.string().required(),
  methodId: joi.string().required(),
  brand: joi.string().required(),
  last4: joi.string().required(),
  expMonth: joi.string().required(),
  expYear: joi.string().required(),
});

module.exports = paymentMethodSchema;