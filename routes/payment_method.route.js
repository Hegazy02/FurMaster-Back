const router = require("express").Router();
const paymentMethodController = require("../controllers/payment_method.controller");
router.get("/", paymentMethodController.getPaymentMethods);
router.post("/", paymentMethodController.createPaymentMethod);
router.patch("/:id", paymentMethodController.updatePaymentMethod);
router.delete("/:id", paymentMethodController.deletePaymentMethod);
module.exports = router;
