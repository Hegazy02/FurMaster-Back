const jwt = require("jsonwebtoken");
const AppError = require("../utils/appError");
const verifyToken = (req, res, next) => {
  
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(" ")[1];
    console.log(token);
    jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
      if (err) throw new AppError("Token is not valid", 403);

      req.user = user;
      next();
    });
  } else {
    throw new AppError("Unauthorized: No token provided", 403);
  }
};
const verifyAdmin = (req, res, next) => {
  if (req.user.role !== "admin") throw new AppError("Unauthorized", 403);

  next();
};

module.exports = { verifyToken, verifyAdmin };
