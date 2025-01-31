import express from "express";
import multer from "multer";
import passport from "../../config/passport.js";

// controllers
import {
  login,
  register,
  googleAuthorization,
  forgetPassword,
  verifyOtp,
  resetPassword,
} from "./auth.controller.js";

const authRoutes = express.Router();
const upload = multer();

// Redirect to Google for authentication
authRoutes.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

authRoutes.get("/google/callback", googleAuthorization);

authRoutes.route("/login").post(upload.none(), login);
authRoutes.route("/register").post(upload.none(), register);
authRoutes.route("/forget-password").patch(upload.none(), forgetPassword);
authRoutes.route("/verify").patch(upload.none(), verifyOtp);
authRoutes.route("/reset-password").patch(upload.none(), resetPassword);
export default authRoutes;
