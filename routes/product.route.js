const express = require("express");
const router = express.Router();
const {
  createProduct,
  getProductById,
  updateProduct,
  deleteProduct,
  getProducts,
} = require("../controllers/product.controller");

router.get("/products", getProducts);
router.get("/products/:id", getProductById);
router.post("/admin/products", createProduct);
router.patch("/admin/products/:id", updateProduct);
router.delete("/admin/products/:id", deleteProduct);
module.exports = router;
