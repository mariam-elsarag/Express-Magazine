import express from "express";

// middleware
import Authorization from "../../middleware/authorization.js";

// controllers
import { createPost } from "./post.controller.js";
import upload from "../../middleware/multer.js";

const router = express.Router();
const authorization = new Authorization();

router.use(authorization.protect);

// routes
router.route("/").post(upload.single("image"), createPost);

export default router;
