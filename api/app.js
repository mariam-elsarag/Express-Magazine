import express from "express";
import cors from "cors";

// for security
import helmet from "helmet";
import xss from "xss-clean";
import hpp from "hpp";
import mongoSanitize from "express-mongo-sanitize";

// routes

// for handle global errors
import globalErrors from "../middleware/globalErrors.js";
import appErrors from "../utils/appErrors.js";
import authRoutes from "./auth/auth.route.js";

const app = express();

const DB = process.env.DATABASE.replace(
  "<db_password>",
  process.env.DATABASE_PASSWORD
);

// body parser
app.use(express.json());

// security
app.use(helmet());
app.use(xss());
// app.use(hpp({ whitelist: [] }));
app.use(hpp());
app.use(mongoSanitize());
app.use(cors());
// handle route

app.use("/api/auth", authRoutes);

// for handle wrong routes
app.all("*", (req, res, next) => {
  next(new appErrors(`Can't find ${req.originalUrl} on this server`, 400));
});

// for handle global errors
app.use(globalErrors);
export default app;
