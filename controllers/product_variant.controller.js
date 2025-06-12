const Product = require("../models/products.js");
const AppError = require("../utils/appError");
const {
  addVariantSchema,
  updateVariantSchema,
} = require("../validators/product_variant.validation.js");
const addProductVariant = async (req, res, next) => {
  const data = req.body;
  if (req.file && req.file.path) {
    data.image = req.file.path;
  }
  const { error } = addVariantSchema.validate(data);
  if (error) throw new AppError(error.message, 400);

  const { colorId, stock, image } = data;
  const productId = req.params.id;
  console.log("req.params", req.params.id);

  try {
    const product = await Product.findById(productId);
    if (!product) throw new AppError("Product not found", 404);

    const updatedProduct = await Product.findOneAndUpdate(
      { _id: productId },
      {
        $push: {
          colors: {
            colorId,
            stock,
            image,
          },
        },
      },
      { new: true }
    );
    res.status(200).json({ success: true, data: updatedProduct });
  } catch (error) {
    next(error);
  }
};
const updateProductVariant = async (req, res, next) => {
  const data = req.body;
  if (req.file && req.file.path) {
    data.image = req.file.path;
  }
  data.variantId = req.params.variantId;
  const { error } = updateVariantSchema.validate(data);
  if (error) throw new AppError(error.message, 400);

  const { colorId, stock, image, variantId } = data;
  const productId = req.params.id;

  if (!variantId)
    throw new AppError("variantId is required to find the color variant", 400);

  const updates = {};
  if (colorId) updates["colors.$.colorId"] = colorId;
  if (stock !== undefined) updates["colors.$.stock"] = stock;
  if (image !== undefined) updates["colors.$.image"] = image;

  if (Object.keys(updates).length === 0)
    throw new AppError("No valid fields provided to update", 400);

  try {
    const product = await Product.findById(productId);
    console.log("product", product.title);

    if (!product) throw new AppError("Product not found", 404);

    const updatedProduct = await Product.findOneAndUpdate(
      { _id: productId, "colors._id": variantId },
      { $set: updates },
      { new: true }
    );

    if (!updatedProduct)
      throw new AppError("Product or variant not found", 404);

    res.status(200).json({ success: true, data: updatedProduct });
  } catch (error) {
    next(err);
  }
};
const deleteProductVariant = async (req, res, next) => {
  try {
    const productId = req.params.id;
    const variantId = req.params.variantId;
    const updatedProduct = await Product.findOneAndUpdate(
      { _id: productId },
      { $pull: { colors: { _id: variantId } } },
      { new: true }
    );
    if (!updatedProduct) throw new AppError("Product not found", 404);
    res.status(200).json({ success: true, data: updatedProduct });
  } catch (error) {
    next(error);
  }
};
module.exports = {
  addProductVariant,
  updateProductVariant,
  deleteProductVariant,
};
