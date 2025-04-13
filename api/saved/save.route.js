import express from "express";
import multer from "multer";

const router = express.Router();
const upload = multer();

// controllers
import { toggleSaved, userSavedPosts } from "./save.controller.js";

router.route("/:postId/save").patch(toggleSaved);

// for user saved posts

router.route("/saved").get(userSavedPosts);
export default router;
