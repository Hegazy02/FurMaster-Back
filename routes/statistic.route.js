const express = require("express");

const router = express.Router();
const {
  getCustomerGenderStatistics,
  getTotalOrdersStatistics,
  getTotalOrdersAmountStatistics,
} = require("../controllers/statistic.controller");
router.get("/customerGenderStatistics", getCustomerGenderStatistics);
router.get("/totalOrdersStatistics", getTotalOrdersStatistics);
router.get("/totalOrdersAmountStatistics", getTotalOrdersAmountStatistics);
module.exports = router;
