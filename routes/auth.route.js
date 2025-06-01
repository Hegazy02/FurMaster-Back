
const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const { validateLogin } = require("../validators/login.validation");
const { validateSignup } = require("../validators/signup.validation");
const{validateForgetPassword,validateResetPassword}=require("../validators/forget-password.validation");
router.post("/sginup", validateSignup, authController.sginup);
router.post("/login", validateLogin, authController.login);
router.post("/forget-password",validateForgetPassword,authController.forgetPassword);
router.post("/reset-password",validateResetPassword,authController.resetPassword);
module.exports = router;



