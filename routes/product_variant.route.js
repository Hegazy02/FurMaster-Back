const express = require("express");
const upload = require("../middlewares/uploadCloudinary");

const router = express.Router();
const {
  addProductVariant,
  updateProductVariant,
  deleteProductVariant,
} = require("../controllers/product_variant.controller");
router.post("/:id/variant", upload.single("image"), addProductVariant);
router.patch(
  "/:id/variant/:variantId",
  upload.single("image"),
  updateProductVariant
);
router.delete("/:id/variant/:variantId", deleteProductVariant);
module.exports = router;
