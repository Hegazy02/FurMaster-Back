const Joi = require("joi");

const categorySchema = Joi.object({
  name: Joi.string().min(3).max(30).required(),
  image: Joi.string().uri().required()
});

const updateCategorySchema = Joi.object({
  name: Joi.string().min(3).max(30),
  image: Joi.string().uri()
});
module.exports= {categorySchema,updateCategorySchema}
