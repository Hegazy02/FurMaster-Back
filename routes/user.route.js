const router = require("express").Router();
const userController = require("../controllers/user.controller");
const { verifyToken } = require("../middlewares/auth.middleware");
const upload = require("../middlewares/uploadCloudinary");
const currentUserPrefex = "/users/me";
router.get(currentUserPrefex, verifyToken, userController.getMe);
router.patch(
  currentUserPrefex,
  verifyToken,
  upload.single("image"),
  userController.updateMe
);
//admin
router.get("/admin/users", userController.getUsers);
router.patch("/admin/users/:id", userController.updateUser);
module.exports = router;
