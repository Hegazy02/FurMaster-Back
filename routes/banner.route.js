const router = require("express").Router();
const bannerController = require("../controllers/banner.controller");
const upload = require("../middlewares/uploadCloudinary");

router.get("/banners", bannerController.getBanners);
router.post("/admin/banners", upload.single("image"), bannerController.createBanner);
router.patch("/admin/banners/:id", upload.single("image"), bannerController.updateBanner);
router.delete("/admin/banners/:id", bannerController.deleteBanner);
module.exports = router;
