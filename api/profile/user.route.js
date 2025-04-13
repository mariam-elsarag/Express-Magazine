import express from "express";

// middleware
import Authorization from "../../middleware/authorization.js";
// controller
import {
  userData,
  getUserPosts,
  profileData,
  updateProfileData,
} from "./user.controller.js";

// routs
import saveRoutes from "../saved/save.route.js";
import upload from "../../middleware/multer.js";
const router = express.Router({ mergeParams: true });

// routes
const authorization = new Authorization();

router.route("/:id/latest-posts").get(getUserPosts);
router.route("/:id/personal-data").get(userData);

router.use(authorization.protect);
router.route("/profile").get(profileData);
router.route("/").patch(
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "cover_image", maxCount: 1 },
  ]),
  updateProfileData
);

router.use(saveRoutes);
export default router;
