const jwt = require("jsonwebtoken");
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(" ")[1];
    jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
      if (err) {
        return res
          .status(403)
          .json({ success: false, message: "Token is not valid" });
      }
      req.user = user;
      next();
    });
  } else {
    return res
      .status(401)
      .json({ success: false, message: "Unauthorized: No token provided" });
  }
};
const verifyAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ success: false, message: "Unauthorized" });
  }
  next();
};

module.exports = { verifyToken, verifyAdmin };
