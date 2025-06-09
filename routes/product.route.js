const express = require("express");
const router = express.Router();
const {
  createProduct,
  getProductById,
  updateProduct,
  updateProductColor,
  deleteProduct,
  getProducts,
  getAdminProducts,
} = require("../controllers/product.controller");

router.get("/products", getProducts);
router.get("/products/:id", getProductById);
//admin
router.get("/admin/products", getAdminProducts);
router.post("/admin/products", createProduct);
router.patch("/admin/products/:id", updateProduct);
router.patch('/admin/products/:id/color', updateProductColor);
router.delete("/admin/products/:id", deleteProduct);
module.exports = router;
