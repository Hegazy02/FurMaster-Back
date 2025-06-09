
const Joi = require("joi");

const productSchema = Joi.object({
    title: Joi.string().min(3).max(200).required(),
    description: Joi.string().min(10).max(1000).required(),
    categoryId: Joi.string().hex().length(24).required(),
    ratingCounter: Joi.number().integer().min(0).optional(),
    rating: Joi.number().min(0).max(5).optional(),
    price: Joi.number().min(0).required(),
    offerPrice: Joi.number().min(0).optional(),
    colors: Joi.array()
        .items(
            Joi.object({
                colorId: Joi.string().hex().length(24).optional(),
                stock: Joi.number().integer().min(0).default(0),
                image: Joi.string().uri().optional(),
            })
        )
        .optional(),
});

const updateProductSchema = Joi.object({
    title: Joi.string().min(3).max(200),
    description: Joi.string().min(10).max(1000),
    categoryId: Joi.string().hex().length(24),
    ratingCounter: Joi.number().integer().min(0),
    rating: Joi.number().min(0).max(5),
    price: Joi.number().min(0),
    offerPrice: Joi.number().min(0),
    colors: Joi.array()
        .items(
            Joi.object({
                colorId: Joi.string().hex().length(24),
                stock: Joi.number().integer().min(0),
                image: Joi.string().uri(),
            })
        )
        .optional(),

});

const updateProductColorSchema = Joi.object({
  colorId: Joi.string().hex().length(24).required(),
  newColorId: Joi.string().hex().length(24),
  stock: Joi.number().integer().min(0),
  image: Joi.string().uri()
});



module.exports = { productSchema, updateProductSchema , updateProductColorSchema}