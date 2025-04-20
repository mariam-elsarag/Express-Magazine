import express from "express";
import multer from "multer";
// middleware
import Authorization from "../../middleware/authorization.js";
import upload from "../../middleware/multer.js";

// controllers
import { createPost, updatePost, viewPost } from "./post.controller.js";
import { createComment } from "../comment/comment.controller.js";

// subroutes
import rateRoutes from "../rating/rate.route.js";
import saveRoutes from "../saved/save.route.js";
import commentRoutes from "../comment/comment.route.js";

const router = express.Router({ mergeParams: true });

const authorization = new Authorization();

router.route("/:id/view").patch(viewPost);
router.use(commentRoutes);

// protected routes
router.use(authorization.protect);

router.route("/").post(upload.single("image"), createPost);
router.route("/:id").patch(upload.single("image"), updatePost);
// router.route("/:id/comment").post(upload.none(), createComment);

router.use(rateRoutes);
router.use(saveRoutes);

export default router;
