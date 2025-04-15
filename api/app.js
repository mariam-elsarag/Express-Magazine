import express from "express";
import cors from "cors";

// for security
import helmet from "helmet";
import xss from "xss-clean";
import hpp from "hpp";
import mongoSanitize from "express-mongo-sanitize";

// for handle global errors
import globalErrors from "../middleware/globalErrors.js";
import appErrors from "../utils/appErrors.js";

// routes
import authRoutes from "./auth/auth.route.js";
import postRoutes from "./post/post.route.js";
import categoryRoutes from "./category/category.route.js";
import profileRoutes from "./profile/user.route.js";
import homeRoutes from "./home/home.route.js";

const app = express();

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
app.use("/api/category", categoryRoutes);
app.use("/api/post", postRoutes);
app.use("/api/user", profileRoutes);
app.use("/api/home", homeRoutes);

// for handle wrong routes
app.all("*", (req, res, next) => {
  next(new appErrors(`Can't find ${req.originalUrl} on this server`, 400));
});

// for handle global errors
app.use(globalErrors);
export default app;
