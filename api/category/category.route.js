import express from "express";

// middleware
import Authorization from "../../middleware/authorization.js";
import upload from "../../middleware/multer.js";

// controllers
import {
  createNewCategory,
  deleteCategory,
  getAllCategories,
  getAllPaginatedCategories,
  updateCategory,
} from "./category.controller.js";

const router = express.Router();

const authorization = new Authorization();
const requireAdmin = [authorization.protect, authorization.authorized("admin")];

router
  .route("/")
  .post(...requireAdmin, upload.single("icon"), createNewCategory)
  .get(getAllPaginatedCategories);
router.route("/all").get(getAllCategories);
router.use(...requireAdmin);
router
  .route("/:id")
  .delete(deleteCategory)
  .patch(upload.single("icon"), updateCategory);
export default router;
