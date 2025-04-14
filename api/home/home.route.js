import express from "express";

// controller
import { footbalNewsApi } from "./home.controller.js";

const router = express.Router();

router.route("/football-news").get(footbalNewsApi);
export default router;
