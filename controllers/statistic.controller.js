const mongoose = require("mongoose");
const User = require("../models/user");
const AppError = require("../utils/appError");
const Order = require("../models/order");
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
const getTotalOrdersStatistics = async (req, res, next) => {
  try {
    const { from, to } = req.query;
    const fromDate = new Date(from);
    const toDate = new Date(to);

    if (isNaN(fromDate) || isNaN(toDate)) {
      throw new AppError("Invalid date format", 400);
    }

    // Calculate previous period
    const periodLengthMs = toDate.getTime() - fromDate.getTime();
    const prevToDate = new Date(fromDate.getTime() - 1);
    const prevFromDate = new Date(prevToDate.getTime() - periodLengthMs);

    // Combine all logic into a single aggregation
    const combinedStats = await Order.aggregate([
      {
        $facet: {
          currentPeriod: [
            {
              $match: {
                createdAt: { $gte: fromDate, $lte: toDate },
              },
            },
            {
              $group: {
                _id: null,
                totalOrders: { $sum: 1 },
              },
            },
          ],
          previousPeriod: [
            {
              $match: {
                createdAt: { $gte: prevFromDate, $lte: prevToDate },
              },
            },
            {
              $group: {
                _id: null,
                totalOrders: { $sum: 1 },
              },
            },
          ],
          dailyCounts: [
            {
              $match: {
                createdAt: { $gte: fromDate, $lte: toDate },
              },
            },
            {
              $group: {
                _id: {
                  $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
                },
                count: { $sum: 1 },
              },
            },
            {
              $sort: { _id: 1 },
            },
          ],
        },
      },
    ]);

    const currentOrderCount =
      combinedStats[0].currentPeriod[0]?.totalOrders || 0;
    const prevOrderCount = combinedStats[0].previousPeriod[0]?.totalOrders || 0;

    // Fill in missing days with 0
    const dailyMap = new Map(
      combinedStats[0].dailyCounts.map((item) => [item._id, item.count])
    );

    const dailyCounts = [];
    const current = new Date(fromDate);
    while (current <= toDate) {
      const dateStr = current.toISOString().split("T")[0];
      dailyCounts.push({
        date: dateStr,
        count: dailyMap.get(dateStr) || 0,
      });
      current.setDate(current.getDate() + 1);
    }

    let percentageChange = 0;
    if (prevOrderCount > 0) {
      percentageChange =
        ((currentOrderCount - prevOrderCount) / prevOrderCount) * 100;
      percentageChange = Math.round(percentageChange * 100) / 100;
    } else if (currentOrderCount > 0) {
      percentageChange = 100;
    }

    res.status(200).json({
      success: true,
      data: {
        ordersCount: currentOrderCount,
        percentageChange,
        dailyCounts,
      },
    });
  } catch (err) {
    next(err);
  }
};
const getTotalOrdersAmountStatistics = async (req, res, next) => {
  try {
    const { from, to } = req.query;
    const fromDate = new Date(from);
    const toDate = new Date(to);

    if (isNaN(fromDate) || isNaN(toDate)) {
      throw new AppError("Invalid date format", 400);
    }

    const periodLengthMs = toDate.getTime() - fromDate.getTime();
    const prevToDate = new Date(fromDate.getTime() - 1);
    const prevFromDate = new Date(prevToDate.getTime() - periodLengthMs);

    const combinedStats = await Order.aggregate([
      {
        $facet: {
          currentPeriod: [
            {
              $match: {
                createdAt: { $gte: fromDate, $lte: toDate },
              },
            },
            {
              $group: {
                _id: null,
                totalAmount: { $sum: "$amountTotal" },
              },
            },
          ],
          previousPeriod: [
            {
              $match: {
                createdAt: { $gte: prevFromDate, $lte: prevToDate },
              },
            },
            {
              $group: {
                _id: null,
                totalAmount: { $sum: "$amountTotal" },
              },
            },
          ],
          dailyAmounts: [
            {
              $match: {
                createdAt: { $gte: fromDate, $lte: toDate },
              },
            },
            {
              $group: {
                _id: {
                  $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
                },
                total: { $sum: "$amountTotal" },
              },
            },
            {
              $sort: { _id: 1 },
            },
          ],
        },
      },
    ]);

    const currentTotalAmount =
      combinedStats[0].currentPeriod[0]?.totalAmount || 0;
    const prevTotalAmount =
      combinedStats[0].previousPeriod[0]?.totalAmount || 0;

    // Fill in missing days with 0
    const dailyMap = new Map(
      combinedStats[0].dailyAmounts.map((item) => [item._id, item.total])
    );

    const dailyTotals = [];
    const current = new Date(fromDate);
    while (current <= toDate) {
      const dateStr = current.toISOString().split("T")[0];
      dailyTotals.push({
        date: dateStr,
        totalOrders: dailyMap.get(dateStr) || 0,
      });
      current.setDate(current.getDate() + 1);
    }

    // Calculate percentage change based on totalAmount
    let percentageChange = 0;
    if (prevTotalAmount > 0) {
      percentageChange =
        ((currentTotalAmount - prevTotalAmount) / prevTotalAmount) * 100;
      percentageChange = Math.round(percentageChange * 100) / 100;
    } else if (currentTotalAmount > 0) {
      percentageChange = 100;
    }

    // Respond
    res.status(200).json({
      success: true,
      data: {
        totalAmount: currentTotalAmount,
        percentageChange,
        dailyTotals,
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getCustomerGenderStatistics,
  getTotalOrdersStatistics,
  getTotalOrdersAmountStatistics,
};
