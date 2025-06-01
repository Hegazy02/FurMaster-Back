const jwt = require('jsonwebtoken');


const verifyTokenAndAdmin = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
      if (err) {
        return res.status(403).json({ success: false, message: 'Token is not valid' });
      }
      if (user.role && user.role === 'admin') {
        req.user = user;
        next();
      } else {
        return res.status(403).json({ success: false, message: 'Access denied, admin only' });
      }
    });
  } else {
    return res.status(401).json({ success: false, message: 'Unauthorized: No token provided' });
  }
};

module.exports = { verifyTokenAndAdmin };


