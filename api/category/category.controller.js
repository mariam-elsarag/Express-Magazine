import Category from "./category.model.js";
// utils
import appErrors from "../../utils/appErrors.js";
import asyncWraper from "../../utils/asyncWraper.js";
import serializeBody from "../../utils/serializeBody.js";

// config
import cloudinary from "./../../config/cloudinary.js";

// create category
export const createNewCategory = asyncWraper(async (req, res, next) => {
  const requiredFields = ["title"];
  const filterData = serializeBody(req.body, next, requiredFields);

  if (!req.file) {
    return next(new appErrors("Category icon is required", 400));
  }

  try {
    const result = await cloudinary.uploader.upload_stream(
      { folder: "/mediafiles/categories" },
      async (error, result) => {
        if (error) {
          return next(new appErrors([{ icon: "Failed to upload image" }], 500));
        }

        filterData.icon = result.secure_url;

        try {
          const category = await Category.create(filterData);
          res.status(201).json(category);
        } catch (err) {
          return next(err);
        }
      }
    );
    result.end(req.file.buffer);
  } catch (err) {
    next(err);
  }
});
