import express from "express";
import multer from "multer";

const router = express.Router();
const upload = multer();

// controllers
import { toggleSaved } from "./save.controller.js";

router.route("/:postId/save").patch(toggleSaved);

export default router;
