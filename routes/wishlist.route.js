const express = require("express");
const router = express.Router();

const {
  addToWishlist,
  removeFromWishlist,
  getWishlist,
} = require("../controllers/wishlist.controller");

const { verifyToken } = require("../middlewares/auth.middleware");

router.get("/wishlist", verifyToken, getWishlist);
router.post("/wishlist/:productId", verifyToken, addToWishlist);
router.delete("/wishlist/:productId", verifyToken, removeFromWishlist);

module.exports = router;
