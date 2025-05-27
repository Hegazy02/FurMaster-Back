const router = require("express").Router();
const userController = require("../controllers/user.controller");
const upload = require("../middlewares/uploadCloudinary");
const currentUserPrefex="/me"
router.get(currentUserPrefex, userController.getMe);
router.patch(currentUserPrefex, upload.single("image"), userController.updateMe);
module.exports = router;
