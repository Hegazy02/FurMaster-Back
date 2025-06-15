const getOrders = async (req, res, next) => {
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
