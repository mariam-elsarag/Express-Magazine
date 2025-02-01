import express from "express";
import multer from "multer";

// middleware
import Authorization from "../../middleware/authorization.js";

const router = express.Router();
const authorization = new Authorization();
const upload = multer();
router.use(authorization.protect);

import { createPostRate } from "../rating/rating.controller.js";
// for rate post

router.route("/:id/rate").post(upload.none(), createPostRate);

export default router;
