<<<<<<< HEAD
=======
const Joi = require("joi");

>>>>>>> 08e00df3420fd7980873ca4137b91ab2d8aa0875
const categorySchema = Joi.object({
  name: Joi.string().min(3).max(30).required(),
  image: Joi.string().uri().required()
});

<<<<<<< HEAD
const categoryUpdateSchema = Joi.object({
  name: Joi.string().min(3).max(30),
  image: Joi.string().uri()
});
=======
const updateCategorySchema = Joi.object({
  name: Joi.string().min(3).max(30),
  image: Joi.string().uri()
});
module.exports= {categorySchema,updateCategorySchema}
>>>>>>> 08e00df3420fd7980873ca4137b91ab2d8aa0875
