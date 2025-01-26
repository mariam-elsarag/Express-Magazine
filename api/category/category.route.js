import express from "express";

// middleware
import Authorization from "../../middleware/authorization.js";
import upload from "../../middleware/multer.js";

// controllers
import { createNewCategory } from "./category.controller.js";

const router = express.Router();

const authorization = new Authorization();
const requireAdmin = [authorization.protect, authorization.authorized("admin")];

router
  .route("/")
  .post(...requireAdmin, upload.single("icon"), createNewCategory);
// router.use(authorization.protect(), authorization.authorized("admin"));
export default router;
