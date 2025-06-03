const User = require("../models/user");
const appError = require("../utils/appError");

const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
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

    if (!updatedUser) {
      return next(new appError("User not found", 404));
    }

    res.status(200).json(updatedUser);
  } catch (err) {
    next(err);
  }
};
const getUsers = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      email = "",
      isActive = "true",
      orderBy = "createdAt",
      sort = "desc",
    } = req.query;
    const skip = (page - 1) * limit;

    const filter = {
      email: { $regex: email, $options: "i" },
      isActive: { $eq: isActive === "true" ? true : false },
    };

    const users = await User.find(filter)
      .sort({ [orderBy]: sort === "asc" ? 1 : -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(filter);
    res.status(200).json({
      page: Number(page),
      total,
      totalPages: Math.ceil(total / limit),
      success: true,
      message: "Users fetched successfully",
      data: users,
    });
  } catch (err) {
    next(err);
  }
};
const updateUser = async (req, res, next) => {
  try {
    const { isActive } = req.body;
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { isActive },
      {
        new: true,
      }
    );
    if (!updatedUser) {
      return next(new appError("User not found", 404));
    }
    res.status(200).json(updatedUser);
  } catch (err) {
    next(err);
  }
};

module.exports = { getMe, updateMe, getUsers, updateUser };
