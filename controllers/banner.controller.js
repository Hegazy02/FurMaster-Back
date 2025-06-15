const Banner = require("../models/banner");
const AppError = require("../utils/appError");
const BannerSchema = require("../validators/banner");

const createBanner = async (req, res, next) => {
  try {
    const data = req.body;
    if (req.file && req.file.path) {
      data.image = req.file.path;
    }
    const { error } = BannerSchema.validate(data);
    if (error) {
      return next(new AppError(error.message, 400));
    }
    const { image } = data;
    const banner = await Banner.create({ image });
    res.status(201).json(banner);
  } catch (err) {
    next(err);
  }
};
const getBanners = async (req, res, next) => {
  try {
    const banners = await Banner.find();
    res.status(200).json(banners);
  } catch (err) {
    next(err);
  }
};

const deleteBanner = async (req, res, next) => {
  try {
    const banner = await Banner.findByIdAndDelete(req.params.id);
    if (!banner) {
      return next(new AppError("Banner not found", 404));
    }
    res.status(200).json({ message: "Banner deleted successfully" });
  } catch (err) {
    next(err);
  }
};

const updateBanner = async (req, res, next) => {
  try {
    const data = req.body;
    if (req.file && req.file.path) {
      data.image = req.file.path;
    }
    const { error } = BannerSchema.validate(data);
    if (error) {
      return next(new AppError(error.message, 400));
    }
    const banner = await Banner.findById(req.params.id);
    if (!banner) {
      return next(new AppError("Banner not found", 404));
    }
    const updatedBanner = await Banner.findByIdAndUpdate(req.params.id, data, {
      new: true,
    });
    res
      .status(200)
      .json({ message: "Banner updated successfully", data: updatedBanner });
  } catch (err) {
    next(err);
  }
};

module.exports = { createBanner, getBanners, deleteBanner, updateBanner };
