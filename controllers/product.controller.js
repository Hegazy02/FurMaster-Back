const mongoose = require("mongoose");
const Product = require("../models/products.js");
// const Category = require('../models/category.js');
// const Color = require('../models/color.js');
const Joi = require("joi");

const productSchema = Joi.object({
  title: Joi.string().min(3).max(100).required(),
  description: Joi.string().min(10).max(1000).required(),
  categoryId: Joi.string().hex().length(24).required(),
  ratingCounter: Joi.number().integer().min(0).optional(),
  rating: Joi.number().min(0).max(5).optional(),
  price: Joi.number().min(0).required(),
  offerPrice: Joi.number().min(0).optional(),
  image: Joi.string().uri().required(),
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

const createProduct = async (req, res) => {
  const { error } = productSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message,
    });
  }
  try {
    const product = new Product(req.body);
    const savedProduct = await product.save();
    res.status(201).json({ success: true, data: savedProduct });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getProductById = async (req, res) => {
  const id = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid product ID format",
    });
  }

  try {
    const product = await Product.findById(id)
      .populate("categoryId")
      .populate("colors.colorId");

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    res.status(200).json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateProduct = async (req, res) => {
  const { error } = productSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message,
    });
  }
  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedProduct) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }
    res.status(200).json({ success: true, data: updatedProduct });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
    if (!deletedProduct) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }
    res
      .status(200)
      .json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getProducts = async (req, res) => {
  try {
    const {
      key = "",
      page = 1,
      minPrice,
      maxPrice,
      categoryId,
      colorId,
      sortBy = "",
    } = req.query;
    const limit = 10;
    const skip = (page - 1) * limit;
    const filter = {};

    if (key) {
      filter.$or = [
        { title: { $regex: key, $options: "i" } },
        { description: { $regex: key, $options: "i" } },
      ];
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    if (categoryId) {
      filter.categoryId = categoryId;
    }

    if (colorId) {
      filter["colors.colorId"] = colorId;
    }

    let sort = {};

    switch (sortBy) {
      case "price_asc":
        sort = { price: 1 };
        break;
      case "price_desc":
        sort = { price: -1 };
        break;
      case "popularity":
        sort = { ratingCounter: -1 };
        break;
      default:
        sort = {};
    }

    const total = await Product.countDocuments(filter);

    const products = await Product.find(filter)
      .select("title price colors ratingCounter")
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const formattedProducts = products.map((p) => ({
      _id: p._id,
      title: p.title,
      price: p.price,
      image: p.colors && p.colors.length > 0 ? p.colors[0].image : null,
      ratingCounter: p.ratingCounter,
    }));

    res.status(200).json({
      success: true,
      data: formattedProducts,
      pagination: {
        total,
        page: Number(page),
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createProduct,
  getProductById,
  updateProduct,
  deleteProduct,
  getProducts,
};
