const Color = require("../models/color");
const mongoose = require("mongoose");

async function enrichColorsWithDetails(products) {
  const allColors = products.flatMap((p) => p.colors || []);
  const colorIds = [...new Set(allColors.map((c) => c.colorId))];

  const colorDocs = await Color.find({ _id: { $in: colorIds } }).lean();

  const colorMap = Object.fromEntries(
    colorDocs.map((c) => [c._id.toString(), c])
  );

  const enrich = (colors) =>
    colors.map((c) => ({
      ...c,
      hex: colorMap[c.colorId]?.hex || null,
      name: colorMap[c.colorId]?.name || null,
    }));

  if (!Array.isArray(products)) {
    products.colors = enrich(products.colors || []);
    return products;
  }

  return products.map((p) => ({
    ...p,
    colors: enrich(p.colors || []),
  }));
}
const productsPipeline = (filter, skip, limit, sort = {}, project = []) => {
  const pipeline = [
    { $match: filter },
    {
      $addFields: {
        colors: {
          $filter: {
            input: "$colors",
            as: "color",
            cond: { $eq: ["$$color.isDeleted", null] },
          },
        },
      },
    },
    {
      $addFields: {
        colors: {
          $map: {
            input: "$colors",
            as: "color",
            in: {
              stock: "$$color.stock",
              colorId: "$$color.colorId",
              image: "$$color.image",
              colorRefId: { $toObjectId: "$$color.colorId" },
            },
          },
        },
      },
    },
    {
      $lookup: {
        from: "colors",
        localField: "colors.colorRefId",
        foreignField: "_id",
        as: "colorDetails",
      },
    },
    {
      $addFields: {
        colors: {
          $map: {
            input: "$colors",
            as: "color",
            in: {
              $mergeObjects: [
                "$$color",
                {
                  $let: {
                    vars: {
                      matchedDetail: {
                        $first: {
                          $filter: {
                            input: "$colorDetails",
                            as: "detail",
                            cond: {
                              $eq: ["$$detail._id", "$$color.colorRefId"],
                            },
                          },
                        },
                      },
                    },
                    in: {
                      hex: "$$matchedDetail.hex",
                      name: "$$matchedDetail.name",
                    },
                  },
                },
              ],
            },
          },
        },
      },
    },
    {
      $unset: "colorDetails",
    },
    {
      $addFields: {
        colors: {
          $map: {
            input: "$colors",
            as: "color",
            in: {
              stock: "$$color.stock",
              colorId: "$$color.colorId",
              hex: "$$color.hex",
              name: "$$color.name",
              image: "$$color.image",
            },
          },
        },
      },
    },
    {
      $lookup: {
        from: "categories",
        localField: "categoryId",
        foreignField: "_id",
        as: "category",
      },
    },
    {
      $unwind: {
        path: "$category",
        preserveNullAndEmptyArrays: true,
      },
    },
  ];

  if (sort.length > 0) pipeline.push({ $sort: sort });
  pipeline.push(
    { $skip: isNaN(skip) ? 0 : parseInt(skip) },
    { $limit: isNaN(limit) ? 10 : parseInt(limit) }
  );
  const projectFields = {};
  project.forEach((p) => {
    projectFields[p] = 1;
  });
  if (projectFields.length > 0) pipeline.push({ $project: projectFields });

  return pipeline;
};
const productPipeline = (
  id,
  project = [
    "title",
    "description",
    "price",
    "offerPrice",
    "image",
    "rating",
    "ratingCounter",
    "category",
    "colors",
  ]
) => {
  const pipeline = [
    { $match: { _id: new mongoose.Types.ObjectId(id) } },
    {
      $addFields: {
        colors: {
          $filter: {
            input: "$colors",
            as: "color",
            cond: { $eq: ["$$color.isDeleted", null] },
          },
        },
      },
    },
    {
      $addFields: {
        colors: {
          $map: {
            input: "$colors",
            as: "color",
            in: {
              stock: "$$color.stock",
              colorId: "$$color.colorId",
              image: "$$color.image",
              colorRefId: { $toObjectId: "$$color.colorId" },
              _id: "$$color._id",
            },
          },
        },
      },
    },
    {
      $lookup: {
        from: "colors",
        localField: "colors.colorRefId",
        foreignField: "_id",
        as: "colorDetails",
      },
    },
    {
      $addFields: {
        colors: {
          $map: {
            input: "$colors",
            as: "color",
            in: {
              $mergeObjects: [
                "$$color",
                {
                  $let: {
                    vars: {
                      matchedDetail: {
                        $first: {
                          $filter: {
                            input: "$colorDetails",
                            as: "detail",
                            cond: {
                              $eq: ["$$detail._id", "$$color.colorRefId"],
                            },
                          },
                        },
                      },
                    },
                    in: {
                      hex: "$$matchedDetail.hex",
                      name: "$$matchedDetail.name",
                    },
                  },
                },
              ],
            },
          },
        },
      },
    },
    {
      $unset: "colorDetails",
    },
    {
      $addFields: {
        colors: {
          $map: {
            input: "$colors",
            as: "color",
            in: {
              stock: "$$color.stock",
              colorId: "$$color.colorId",
              hex: "$$color.hex",
              name: "$$color.name",
              image: "$$color.image",
              _id: "$$color._id",
            },
          },
        },
      },
    },
    {
      $lookup: {
        from: "categories",
        localField: "categoryId",
        foreignField: "_id",
        as: "category",
      },
    },
    {
      $unwind: {
        path: "$category",
        preserveNullAndEmptyArrays: true,
      },
    },
  ];
  const projectFields = {};
  project.forEach((p) => {
    projectFields[p] = 1;
  });
  if (projectFields.length > 0) pipeline.push({ $project: projectFields });
  return pipeline;
};
module.exports = {
  enrichColorsWithDetails,
  productsPipeline,
  productPipeline,
};
