const express = require('express');
const router = express.Router();
const { getColors, createColor } = require('../controllers/color.controller');

router.get('/colors', getColors);
router.post('/admin/colors', createColor);

module.exports = router;