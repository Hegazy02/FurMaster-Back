const mongoose = require("mongoose");
const User = require("../models/user");
const AppError = require("../utils/appError");
const { productsPipeline, productPipeline } = require("../utils/product");
const getCustomerGenderStatistics = async (req, res, next) => {
  try {
    const currentYear = new Date().getFullYear();
    const months = Array.from({ length: 12 }, (_, i) => i + 1);
    const result = await User.aggregate([
      {
        $facet: {
          monthly: [
            {
              $match: {
                createdAt: {
                  $gte: new Date(currentYear, 0, 1),
                  $lte: new Date(currentYear, 11, 31, 23, 59, 59),
                },
              },
            },
            {
              $project: {
                month: { $month: "$createdAt" },
                gender: 1,
              },
            },
            {
              $group: {
                _id: { month: "$month", gender: "$gender" },
                count: { $sum: 1 },
              },
            },
            {
              $group: {
                _id: "$_id.month",
                genders: {
                  $push: {
                    gender: "$_id.gender",
                    count: "$count",
                  },
                },
              },
            },
            {
              $project: {
                _id: 0,
                month: "$_id",
                male: {
                  $let: {
                    vars: {
                      maleObj: {
                        $arrayElemAt: [
                          {
                            $filter: {
                              input: "$genders",
                              as: "g",
                              cond: { $eq: ["$$g.gender", 0] },
                            },
                          },
                          0,
                        ],
                      },
                    },
                    in: { $ifNull: ["$$maleObj.count", 0] },
                  },
                },
                female: {
                  $let: {
                    vars: {
                      femaleObj: {
                        $arrayElemAt: [
                          {
                            $filter: {
                              input: "$genders",
                              as: "g",
                              cond: { $eq: ["$$g.gender", 1] },
                            },
                          },
                          0,
                        ],
                      },
                    },
                    in: { $ifNull: ["$$femaleObj.count", 0] },
                  },
                },
              },
            },
          ],
          total: [
            {
              $group: {
                _id: "$gender",
                count: { $sum: 1 },
              },
            },
          ],
        },
      },
    ]);

    // Normalize monthly to all months
    const monthlyMap = {};
    result[0].monthly.forEach((entry) => {
      monthlyMap[entry.month] = { male: entry.male, female: entry.female };
    });
    const monthly = months.map((month) => ({
      month,
      male: monthlyMap[month]?.male || 0,
      female: monthlyMap[month]?.female || 0,
    }));

    // Normalize total count with mapped gender values
    const total = result[0].total.reduce(
      (acc, curr) => {
        if (curr._id === 0) acc.male = curr.count;
        else if (curr._id === 1) acc.female = curr.count;
        return acc;
      },
      { male: 0, female: 0 }
    );

    res.status(200).json({
      success: true,
      data: {
        monthly,
        total,
      },
    });
  } catch (error) {
    next(error);
  }
};
module.exports = { getCustomerGenderStatistics };
