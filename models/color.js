const mongoose = require('mongoose');

const colorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      minlength: 3
    },
    hex: {
      type: String,
      required: true,
      match: /^#([0-9a-fA-F]{6})$/
    }
  },
  
);

module.exports = mongoose.model('Color', colorSchema);