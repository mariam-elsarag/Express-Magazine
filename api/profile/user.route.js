import express from "express";

// middleware
import Authorization from "../../middleware/authorization.js";
import { getUsersPosts } from "../posts/post.controller.js";

const router = express.Router();

// routes
const authorization = new Authorization();
router.use(authorization.protect);

router.route("/post").get(getUsersPosts);
export default router;
