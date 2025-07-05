const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    // folder: "users/profile",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    // transformation: [{ width: 500, height: 500, crop: "limit" }],
  },
});
// the max file size is 5mb
const upload = multer({ storage, limits: { fileSize: 1024 * 1024 * 5 } });

module.exports = upload;
