const PaymentMethod = require("../models/payment_method");
const paymentMethodSchema = require("../validators/payment_method");
const AppError = require("../utils/appError");

const createPaymentMethod = async (req, res, next) => {
  try {
    const body = { ...req.body, userId: req.user.id };
    const { error } = paymentMethodSchema.validate(body);
    if (error) {
      return next(new AppError(error.message, 400));
    }
    if (req.body.methodId) {
      const paymentMethod = await PaymentMethod.findOne({
        methodId: req.body.methodId,
      });
      if (paymentMethod) {
        return next(new AppError("Payment method already exists", 400));
      }
    }
    const paymentMethod = await PaymentMethod.create(req.body);
    res.status(201).json(paymentMethod);
  } catch (err) {
    next(err);
  }
};

const getPaymentMethods = async (req, res, next) => {
  try {
    const paymentMethods = await PaymentMethod.find();
    res.status(200).json(paymentMethods);
  } catch (err) {
    next(err);
  }
};
const deletePaymentMethod = async (req, res, next) => {
  try {
    const paymentMethod = await PaymentMethod.findById(req.params.id);
    if (!paymentMethod) {
      return next(new AppError("Payment method not found", 404));
    }
    await PaymentMethod.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Payment method deleted successfully" });
  } catch (err) {
    next(err);
  }
};

const updatePaymentMethod = async (req, res, next) => {
  try {
    const paymentMethod = await PaymentMethod.findById(req.params.id);
    if (!paymentMethod) {
      return next(new AppError("Payment method not found", 404));
    }
    await PaymentMethod.findByIdAndUpdate(req.params.id, req.body);
    res.status(200).json({ message: "Payment method updated successfully" });
  } catch (err) {
    next(err);
  }
};
module.exports = {
  createPaymentMethod,
  getPaymentMethods,
  deletePaymentMethod,
  updatePaymentMethod,
};
