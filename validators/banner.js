const joi = require("joi");
const bannerSchema = joi
  .object({
    image: joi.string().required(),
  })
  .unknown(false);
module.exports = bannerSchema;
