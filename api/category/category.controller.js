import Category from "./category.model.js";
// utils
import appErrors from "../../utils/appErrors.js";
import asyncWraper from "../../utils/asyncWraper.js";
import serializeBody from "../../utils/serializeBody.js";
import ApiFeature from "../../utils/apiFeatures.js";
import { uploadSingleImage } from "../../utils/uploadImage.js";

// config
import deleteOneFromCloudinary from "../../utils/deleteOneFromCloudinary.js";

// create category
export const createNewCategory = asyncWraper(async (req, res, next) => {
  const requiredFields = ["title"];
  const filterData = serializeBody(req.body, next, requiredFields);

  if (!filterData) {
    return;
  }
  if (!req.file) {
    return next(new appErrors([{ icon: "Category icon is required" }], 400));
  }
  const is_category_exist = await Category.findOne({
    title: filterData?.title,
  });
  if (is_category_exist) {
    return next(
      new appErrors("Category with the same title already exists", 409)
    );
  }
  filterData.icon = await uploadSingleImage(
    req,
    "/mediafiles/categories",
    "icon"
  );
  try {
    const category = await Category.create(filterData);
    res.status(201).json(category);
  } catch (err) {
    return next(err);
  }
});

//get all categories

export const getAllCategories = asyncWraper(async (req, res, next) => {
  try {
    const categories = await Category.find({});
    res.status(200).json(categories);
  } catch (err) {
    next(err);
  }
});

// get paginated categories
export const getAllPaginatedCategories = asyncWraper(async (req, res, next) => {
  const features = await new ApiFeature(Category.find(), req.query).paginate(8);
  const categories = await features.getPaginations(Category, req);
  res.status(200).json(categories);
});
//update category

export const updateCategory = asyncWraper(async (req, res, next) => {
  const allowedFields = ["title"];
  const filterData = serializeBody(req.body, next, [], allowedFields);
  const { id } = req.params;
  const category = await Category.findById(id);

  if (!category) {
    return next(new appErrors("Category not found", 404));
  }

  if (!filterData && !req.file) {
    return res.status(200).json(category);
  }

  try {
    if (req.file) {
      const deleteIcon = await deleteOneFromCloudinary(category?.icon);
      if (deleteIcon) {
        return next(new appErrors("Failed to delete category icon", 500));
      }

      category.icon = await uploadSingleImage(
        req,
        "/mediafiles/categories",
        "icon"
      );
    }

    if (filterData?.title) {
      category.title = filterData.title;
    }

    const newCategory = await category.save();
    console.log(newCategory, "new");
    res.status(200).json(newCategory);
  } catch (err) {
    return next(err);
  }
});

// delete category
export const deleteCategory = asyncWraper(async (req, res, next) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    return next(new appErrors("Category not found", 404));
  }
  const deleteIcon = await deleteOneFromCloudinary(category?.icon);
  if (deleteIcon) {
    return next(new appErrors("Failed to delete category icon", 500));
  }
  await category.deleteOne();
  res.status(204).send();
});
