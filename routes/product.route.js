const express = require("express");
const upload = require("../middlewares/uploadCloudinary");

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
router.post("/admin/products", upload.any(), createProduct);
router.patch("/admin/products/:id", upload.any(),updateProduct);
router.patch('/admin/products/:id/color', updateProductColor);
router.delete("/admin/products/:id", deleteProduct);
module.exports = router;
