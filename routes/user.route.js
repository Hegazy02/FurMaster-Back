const router = require("express").Router();
const userController = require("../controllers/user.controller");
const upload = require("../middlewares/uploadCloudinary");
const currentUserPrefex="/users/me"
router.get(currentUserPrefex, userController.getMe);
router.patch(currentUserPrefex, upload.single("image"), userController.updateMe);
//admin
router.get("/admin/users", userController.getUsers);
router.patch("/admin/users/:id", userController.updateUser);
module.exports = router;
