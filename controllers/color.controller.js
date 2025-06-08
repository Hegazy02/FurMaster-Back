const Color = require('../models/color');
const Joi = require('joi');

const colorSchema = Joi.object({
  name: Joi.string().min(3).required(),
  hex: Joi.string().pattern(/^#([0-9a-fA-F]{6})$/).required()
});

const getColors = async (req, res) => {
  try {
    const colors = await Color.find();
    res.status(200).json({ success: true, data: colors });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const createColor = async (req, res) => {
  const { error } = colorSchema.validate(req.body);
  if (error) return res.status(400).json({ success: false, message: error.details[0].message });

  try {
    const newColor = new Color(req.body);
    const saved = await newColor.save();
    res.status(201).json({ success: true, data: saved });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const updateColor = async (req, res) => {
  const { id } = req.params;

  const updateSchema = Joi.object({
    name: Joi.string().min(3),
    hexCode: Joi.string().pattern(/^#([0-9a-fA-F]{6})$/)
  });

  const { error } = updateSchema.validate(req.body);
  if (error) return res.status(400).json({ success: false, message: error.details[0].message });

  try {
    const updatedColor = await Color.findByIdAndUpdate(id, req.body, { new: true });
    if (!updatedColor) {
      return res.status(404).json({ success: false, message: "Color not found" });
    }
    res.status(200).json({ success: true, data: updatedColor });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const deleteColor = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedColor = await Color.findByIdAndDelete(id);
    if (!deletedColor) {
      return res.status(404).json({ success: false, message: "Color not found" });
    }
    res.status(200).json({ success: true, message: "Color deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getColors, createColor, updateColor, deleteColor };
