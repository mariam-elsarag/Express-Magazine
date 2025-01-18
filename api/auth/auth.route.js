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

authRoutes.post("/login", upload.none(), login);
authRoutes.post("/register", upload.none(), register);
authRoutes.patch("/forget-password", upload.none(), forgetPassword);
authRoutes.patch("/verify", upload.none(), verifyOtp);
authRoutes.patch("/reset-password", upload.none(), resetPassword);
export default authRoutes;
