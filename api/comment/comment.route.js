import express from "express";
import multer from "multer";

// middleware
import Authorization from "../../middleware/authorization.js";
// controller
import { commentList, createComment } from "./comment.controller.js";

const router = express.Router();
const upload = multer();

const authorization = new Authorization();
router
  .route("/:postId/comment")
  .get(commentList)
  .post(authorization.protect, upload.none(), createComment);

export default router;
