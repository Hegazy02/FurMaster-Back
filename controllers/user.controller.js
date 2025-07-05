const User = require("../models/user");
const appError = require("../utils/appError");

const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return next(new appError("User not found", 404));
    }
    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
};

const updateMe = async (req, res, next) => {
  try {
    const updateData = req.body;
    if (req.file && req.file.path) {
      updateData.image = req.file.path;
    }

    const updatedUser = await User.findByIdAndUpdate(req.user.id, updateData, {
      new: true,
    });

    res.status(200).json(updatedUser);
  } catch (err) {
    next(err);
  }
};

module.exports = { getMe, updateMe };
