import User from "../api/profile/user.model.js";
import AppError from "../utils/appErrors.js";
import asyncWrapper from "../utils/asyncWraper.js";
import extractAuthorization from "../utils/extractHeader.js";
import jwt from "jsonwebtoken";

class Authorization {
  constructor(
    requireAuthentication = true,
    secret = process.env.JWT_SECRET_KEY
  ) {
    this.requireAuthentication = requireAuthentication;
    this.secret = secret;
  }

  static verifyToken = async (token) => {
    const decoded = jwt.verify(token, this.secret);
    if (!decoded) {
      throw new AppError("Unauthorized: Access is denied", 401);
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      throw new AppError("User no longer exists", 404);
    }

    if (user.checkChangePasswordAfterJWT(decoded.iat)) {
      throw new AppError("User recently changed password", 401);
    }

    return user;
  };

  protect = asyncWrapper(async (req, res, next) => {
    const token = extractAuthorization(req);

    if (this.requireAuthentication && !token) {
      return next(new AppError("Unauthorized: Access is denied", 401));
    }

    if (token) {
      try {
        const user = await Authorization.verifyToken(token);
        req.user = user;
        return next();
      } catch (err) {
        return next(err);
      }
    }

    next();
  });

  static authorized = (...roles) => {
    return (req, res, next) => {
      if (!roles.includes(req.user.role)) {
        return next(
          new AppError(
            "Access denied: You do not have permission to perform this action",
            403
          )
        );
      }
      next();
    };
  };
}

export default Authorization;
