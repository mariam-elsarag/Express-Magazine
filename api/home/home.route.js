import express from "express";

// controller
import { popularPosts } from "./home.controller.js";

const router = express.Router();

router.route("/post/most-viewed").get(popularPosts);
export default router;
