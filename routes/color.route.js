const express = require('express');
const router = express.Router();
const { getColors, createColor } = require('../controllers/color.controller');

router.get('/', getColors);
router.post('/', createColor);

module.exports = router;