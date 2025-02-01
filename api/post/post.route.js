import express from "express";
import multer from "multer";
// middleware
import Authorization from "../../middleware/authorization.js";
import upload from "../../middleware/multer.js";

// controllers
import { createPost, updatePost, viewPost } from "./post.controller.js";

import rateRoutes from "../rating/rate.route.js";
import saveRoutes from "../saved/save.route.js";

const router = express.Router({ mergeParams: true });

const authorization = new Authorization();
const uploadMulter = multer();

router.route("/:id/view").patch(viewPost);

// protected routes
router.use(authorization.protect);
// routes
router.route("/").post(upload.single("image"), createPost);
router.route(":id").post(upload.single("image"), updatePost);

// Mount rate routes for rating a post
router.use(rateRoutes);
router.use(saveRoutes);
export default router;
