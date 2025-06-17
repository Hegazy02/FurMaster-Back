const express = require("express");
const router = express.Router();

const {
  getCategory,
  getCategoryById,
  createCategory,
  deleteCategory,
  updateCategory,
  getProductsByCategoryId
} = require('../controllers/category.controller');


router.get('/categories', getCategory);
router.get('/categories/:id', getCategoryById); 
router.post('/admin/categories', createCategory);
router.delete('/admin/categories/:id', deleteCategory);
router.patch('/admin/categories/:id', updateCategory);

module.exports = router;