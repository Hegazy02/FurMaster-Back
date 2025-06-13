const Category = require('../models/category');
const mongoose = require('mongoose');
const Product = require('../models/products'); 

const Joi = require('joi');
const {
  categorySchema,
  categoryUpdateSchema,
} = require("../validators/product.validation.js");


const getCategory = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 8;
  const skip = (page - 1) * limit;
  const search = req.query.search || "";

  const filter = {};
  if (search) {
    filter.name = { $regex: search, $options: "i" };
  }

  try {
    const categoryList = await Category.find(filter).skip(skip).limit(limit);
    const total = await Category.countDocuments(filter);

    if (!categoryList || categoryList.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No categories found" });
    }

    res.status(200).json({
      success: true,
      page,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      data: categoryList,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }
    res.status(200).json(category);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getProductsByCategoryId = async (req, res) => {
  try {
    const products = await Product.find({ categoryId: req.params.id }).populate('categoryId');
    
    if (!products || products.length === 0) {
      return res.status(404).json({ success: false, message: "No products found for this category" });
    }

    res.status(200).json({
      success: true,
      data: products,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};



const createCategory = async (req, res) => {
  const { error } = categorySchema.validate(req.body);

  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message,
    });
  }

  try {
    const { name, image } = req.body;

    const category = new Category({ name, image });
    const savedCategory = await category.save();

    res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: savedCategory,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating category",
      error: error.message,
    });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found!" });
    }
    res.status(200).json({
      success: true,
      message: "Category deleted successfully",
      data: category,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateCategory = async (req, res) => {
  const { error } = updateCategorySchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message,
    });
  }
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid category ID" });
  }
  try {
    const updatedCategory = await Category.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        image: req.body.image,
      },
      { new: true }
    );
    if (!updatedCategory) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }
    res.status(200).json({
      success: true,
      message: "Category updated successfully",
      data: updatedCategory,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

module.exports = { createCategory, deleteCategory, getCategory, getCategoryById, updateCategory, getProductsByCategoryId }
