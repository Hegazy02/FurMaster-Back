
const User = require("../models/user");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
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



module.exports = { sginup, login }