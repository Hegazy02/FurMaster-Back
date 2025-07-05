const mongoose = require("mongoose");
const Product = require("../models/products.js");
const {
  productSchema,
  updateProductSchema,
} = require("../validators/product.validation.js");
const AppError = require("../utils/appError");
const { productsPipeline, productPipeline } = require("../utils/product");

const createProduct = async (req, res, next) => {
  const { error } = productSchema.validate(req.body);
  if (error) throw new AppError(error.message, 400);

  try {
    const images = req.files.map((file) => file.path);
    images.forEach((image, index) => {
      req.body.colors[index].image = image;
    });

    const product = new Product(req.body);
    const savedProduct = await product.save();
    res.status(201).json({ success: true, data: savedProduct });
  } catch (error) {
    next(error);
  }
};

const getProductById = async (req, res, next) => {
  const id = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(id))
    throw new AppError("Invalid ID", 400);

  try {
    const products = await Product.aggregate(
      productPipeline(id, [
        "title",
        "price",
        "offerPrice",
        "image",
        "rating",
        "ratingCounter",
        "category",
        "colors",
      ])
    );
    if (products.length == 0 || products[0].isDeleted)
      throw new AppError("Product not found", 404);

    res.status(200).json({ success: true, data: products[0] });
  } catch (error) {
    next(error);
  }
};

const updateProduct = async (req, res) => {
  const { error } = updateProductSchema.validate(req.body);
  if (error) {
    return res
      .status(400)
      .json({ success: false, message: error.details[0].message });
  }

  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );

    if (!updatedProduct) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    return res.status(200).json({ success: true, data: updatedProduct });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    const deletedProduct = await Product.findByIdAndUpdate(req.params.id, {
      $set: { isDeleted: new Date() },
    });
    if (!deletedProduct) throw new AppError("Product not found", 404);

    res
      .status(200)
      .json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    next(error);
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
      limit = 10,
    } = req.query;
    const skip = (page - 1) * limit;
    const filter = { isDeleted: null };

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
      const ids = categoryId.split(",");
      filter.categoryId = {
        $in: ids.map((id) => new mongoose.Types.ObjectId(id)),
      };
    }

    if (colorId) {
      const colorIds = colorId
        .split(",")
        .map((id) => new mongoose.Types.ObjectId(id));
      filter["colors.colorId"] = { $in: colorIds };
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
    const products = await Product.aggregate(
      productsPipeline(filter, skip, limit, sort, [
        "title",
        "price",
        "offerPrice",
        "image",
        "rating",
        "ratingCounter",
        "category",
        "colors",
      ])
    );

    res.status(200).json({
      success: true,
      data: products,
      total,
      page: Number(page),
      limit,
      totalPages: Math.ceil(total / limit),
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
    // const filter = {};
    const filter = { isDeleted: null };

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

    let sort = { createdAt: -1 };

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
      case "out_of_stock":
        filter["colors"] = {
          $not: {
            $elemMatch: { stock: { $gte: 1 } },
          },
        };
      default:
        console.log("Default case");
    }

    const total = await Product.countDocuments(filter);
    const products = await Product.aggregate(
      productsPipeline(filter, skip, limit, sort, [
        "title",
        "price",
        "offerPrice",
        "image",
        "rating",
        "ratingCounter",
        "category",
        "colors",
      ])
    );

    res.status(200).json({
      success: true,
      message: "Users fetched successfully",
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit),
      data: products,
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
  getAdminProducts,
};
