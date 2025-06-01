const express = require('express');
const { verifyTokenAndAdmin } = require('../middlewares/auth.middleware');
const router = express.Router();
const {
  createProduct,
  getProductById,
  updateProduct,
  deleteProduct,
  getAndSearchProducts
} = require('../controllers/product.controller');


router.get('/', getAndSearchProducts);
router.get('/:id', getProductById);
router.post('/', verifyTokenAndAdmin, createProduct);
router.put('/:id', verifyTokenAndAdmin, updateProduct);
router.delete('/:id', verifyTokenAndAdmin, deleteProduct);
module.exports = router;
