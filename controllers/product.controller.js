const mongoose = require("mongoose");
const Product = require("../models/products.js");
// const Category = require('../models/category.js');
// const Color = require('../models/color.js');
const {
  productSchema,
  updateProductSchema,
  updateProductColorSchema
} = require("../validators/product.validation.js")



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
  const { error } = updateProductSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ success: false, message: error.details[0].message });
  }

  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    return res.status(200).json({ success: true, data: updatedProduct });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};



const updateProductColor = async (req, res) => {
  const { error } = updateProductColorSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ success: false, message: error.details[0].message });
  }

  const { variantId, colorId, stock, image } = req.body;
  const productId = req.params.id;

  if (!variantId) {
    return res.status(400).json({ success: false, message: 'variantId is required to find the color variant' });
  }

  const updates = {};
  if (colorId) updates['colors.$.colorId'] = colorId;
  if (stock !== undefined) updates['colors.$.stock'] = stock;
  if (image !== undefined) updates['colors.$.image'] = image;

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ success: false, message: 'No valid fields provided to update' });
  }

  try {
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    console.log('Product ID:', productId);
    console.log('variantId:', variantId);
    console.log('Available color IDs:', product.colors.map(c => c._id.toString()));

    const updatedProduct = await Product.findOneAndUpdate(
      { _id: productId, 'colors._id': variantId },
      { $set: updates },
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ success: false, message: 'Product or variant not found' });
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
const getAdminProducts = async (req, res) => {
  try {
    const {
      title = "",
      minPrice,
      maxPrice,
      categoryId,
      colorId,
      sortBy = "createdAt_desc",
      page = 1,
      limit = 10,
    } = req.query;
    const skip = (page - 1) * limit;
    const filter = {};

    if (title) {
      filter.$or = [{ title: { $regex: title, $options: "i" } }];
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
    if (sortBy === "out_of_stock") {
      filter["colors"] = {
        $not: {
          $elemMatch: { stock: { $gte: 1 } },
        },
      };
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
      case "createdAt_asc":
        sort = { createdAt: 1 };
        break;
      case "createdAt_desc":
        sort = { createdAt: -1 };
        break;
      case "title_asc":
        sort = { title: 1 };
        break;
      case "title_desc":
        sort = { title: -1 };
      default:
        sort = {};
    }
    console.log("filter", filter);

    const total = await Product.countDocuments(filter);

    const products = await Product.find(filter)
      .select("title price offerPrice rating ratingCounter colors categoryId")
      .populate("colors.colorId")
      .populate("categoryId")
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const formattedProducts = products.map((p) => ({
      _id: p._id,
      title: p.title,
      price: p.price,
      offerPrice: p.offerPrice,
      rating: p.rating,
      ratingCounter: p.ratingCounter,
      category: {
        _id: p.categoryId?._id,
        name: p.categoryId?.name,
      },
      colors: p.colors.map((c) => ({
        _id: c._id,
        name: c.colorId?.name,
        hex: c.colorId?.hex,
        stock: c.stock,
        image: c.image,
      })),
    }));

    res.status(200).json({
      success: true,
      message: "Users fetched successfully",
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit),
      data: formattedProducts,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
module.exports = {
  createProduct,
  getProductById,
  updateProduct,
  updateProductColor,
  deleteProduct,
  getProducts,
  getAdminProducts,
};
