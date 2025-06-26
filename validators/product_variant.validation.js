const Joi = require("joi");

const updateVariantSchema = Joi.object({
  variantId: Joi.string().length(24).required(),
  colorId: Joi.string().length(24).required(),
  stock: Joi.number().integer().min(0).required(),
  image: Joi.string().uri().required(),
});
const addVariantSchema = Joi.object({
  colorId: Joi.string().length(24).required(),
  stock: Joi.number().integer().min(0).required(),
  image: Joi.string().uri().required(),
});

module.exports = { updateVariantSchema, addVariantSchema };
