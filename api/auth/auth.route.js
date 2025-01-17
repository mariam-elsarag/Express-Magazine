import express from "express";
import multer from "multer";
import passport from "../../config/passport.js";

// controllers
import { login, register, googleAuthorization } from "./auth.controller.js";

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
export default authRoutes;
