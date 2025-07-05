const express = require("express");

const router = express.Router();
const {
  getCustomerGenderStatistics,
  getTotalOrdersStatistics,
  getTotalOrdersAmountStatistics,
  getBestSellingProducts,
} = require("../controllers/statistic.controller");
router.get("/customerGenderStatistics", getCustomerGenderStatistics);
router.get("/totalOrdersStatistics", getTotalOrdersStatistics);
router.get("/totalOrdersAmountStatistics", getTotalOrdersAmountStatistics);
router.get("/bestSellingProducts", getBestSellingProducts);
module.exports = router;
