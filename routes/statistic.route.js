const express = require("express");

const router = express.Router();
const {
  getCustomerGenderStatistics,
} = require("../controllers/statistic.controller");
router.get("/customerGenderStatistics", getCustomerGenderStatistics);
module.exports = router;
