
const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const { validateLogin } = require("../validators/login.validation");
const { validateSignup } = require("../validators/signup.validation");
router.post("/sginup", validateSignup, authController.sginup);
router.post("/login", validateLogin, authController.login);
module.exports = router;
