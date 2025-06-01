
const User = require("../models/user");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

require("dotenv").config();

const bycrypt = require("bcrypt");
const accountSid = "ACee18fea81c10900d04a9320d4d8fc97c";
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require("twilio")(accountSid, authToken);
const AppError=require("../utils/appError");

const sginup = async (req, res, next) => {
  try {
    const {

      password, ...userObj
    } = req.body;

    const hashedPassword = await bcrypt.hash(password, +process.env.SALT_Round);

    const user = await User.create({
    ...userObj,
      password: hashedPassword,
    });

    const token = jwt.sign({ id:user._id,role:'user' }, process.env.JWT_SECRT);

    const userData = user.toObject();
    delete userData.password;

    res.status(201).json({ token, user: userData });

  } catch (err) {
    next(err);
  }
};



const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      throw new Error("invalid credentials");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new Error("invalid credentials");
    }

    const token = jwt.sign({ id:user._id,role:'user'}, process.env.JWT_SECRT);

    const userData = user.toObject();
    delete userData.password;

    res.send({ token, user: userData });

  } catch (err) {
    next(err);
  }
};


//==========================TWILIO==========================

const generateOTP = () => {
  const otp = Math.floor(Math.random() * 10000);
  return otp;
};
const sendOTP = async (phoneNumberReceiver) => {
  const otp = generateOTP();

  client.messages
    .create({
      from: "whatsapp:+14155238886",
      contentSid: "HX229f5a04fd0510ce1b071852155d3e75",
      contentVariables: `{"1":"${otp}"}`,
      to: "whatsapp:+201223057728",
      // to: `whatsapp:${phoneNumberReceiver}`,
    })
    .then((message) => console.log(message.sid))
    .catch(error => console.error(error));

  return otp;
};
const verifyOTP = (userOTP, otp) => userOTP === otp;
const forgetPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return next(new AppError("User not found", 404));
    }
    const otp = await sendOTP(user.phoneNumber);
    res.status(200).json({ message: "OTP sent successfully", otp });
  } catch (err) {
    next(err);
  }
};
const resetPassword = async (req, res, next) => {
  try {
    const { userOtp, otp, email, password } = req.body;
    if (!verifyOTP(userOtp, otp)) {
      return next(new AppError("Invalid OTP", 400));
    }
    const user = await User.findOne({ email });
    if (!user) {
      return next(new AppError("User not found", 404));
    }
    const salt = await bycrypt.genSalt(10);
    const hashedPassword = await bycrypt.hash(password, salt);
    user.password = hashedPassword;
    await user.save();
    const { password: _p, ...userData } = user.toObject();
    const token = jwt.sign({ id:user._id,role:'user' }, process.env.JWT_SECRT);
    res
      .status(200)
      .json({ message: "Password reset successfully", user: userData ,token});
  } catch (err) {
    next(err);
  }
};


module.exports = { sginup, login,forgetPassword, resetPassword}