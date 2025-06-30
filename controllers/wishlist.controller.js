const mongoose = require("mongoose");
const User = require("../models/user.js");
const Product = require("../models/products.js");
const AppError = require("../utils/appError.js");
 const color = require("../models/color");
 const { productsPipeline } = require("../utils/product");



const addToWishlist = async (req, res, next) => {
  const userId = req.user._id;
  const { productId } = req.params;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return next(new AppError("User not found", 404));
    }

    if (!user.wishlist.includes(productId)) {
      user.wishlist.push(productId);
      await user.save();
    }

    await user.populate({
      path: 'wishlist',
      select: 'title price offerPrice rating ratingCounter category colors',
      populate: {
        path: 'colors.colorId',
         model: 'Color',
        select: 'name hex',
      }
    });

    res.status(200).json({ success: true, data: user.wishlist });
  } catch (error) {
    next(error);
  }
};

const removeFromWishlist = async (req, res, next) => {
  const userId = req.user._id;
  const { productId } = req.params;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return next(new AppError("User not found", 404));
    }

    user.wishlist = user.wishlist.filter(
      (id) => id.toString() !== productId
    );
    await user.save();

    await user.populate({
      path: 'wishlist',
      select: 'title price offerPrice rating ratingCounter category colors',
      populate: {
        path: 'colors.colorId',
         model: 'Color',
        select: 'name hex',
      }
    });


    res.status(200).json({
      success: true,
      message: "Product removed from wishlist",
      data: user.wishlist,
    });
  } catch (error) {
    next(error);
  }
};

const getWishlist = async (req, res, next) => {
  const userId = req.user._id;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return next(new AppError("User not found", 404));
    }

    const wishlistProductIds = user.wishlist;

       if (!wishlistProductIds.length) {
      return res.status(200).json({ success: true, data: [] });
    }

    const wishlistProducts = await Product.aggregate(
      productsPipeline(
        { _id: { $in: wishlistProductIds }, isDeleted: null },
        0,
        wishlistProductIds.length, 
        {},
        [
          "title",
          "price",
          "offerPrice",
          "rating",
          "ratingCounter",
          "category",
          "colors",
        ]
      )
    );

    res.status(200).json({ success: true, data: wishlistProducts });
  } catch (error) {
    next(error);
  }
};


module.exports = {
  addToWishlist,
  removeFromWishlist,
  getWishlist,
};
