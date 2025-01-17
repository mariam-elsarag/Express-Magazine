import User from "../profile/user.model.js";
// utils
import { generateTokens } from "../../utils/generateTokens.js";
import serializeBody from "../../utils/serializeBody.js";
import asyncWraper from "./../../utils/asyncWraper.js";
import appErrors from "../../utils/appErrors.js";
import CRUDService from "../../service/CRUDService.js";
import AuthSerializer from "./auth.serializer.js";

// for google
import passport from "../../config/passport.js";

// login
export const login = asyncWraper(async (req, res, next) => {
  const requiredFields = ["email", "password"];
  const filterdData = serializeBody(req.body, next, requiredFields);
  const user = await User.findOne({ email: filterdData.email }).select(
    "password email full_name role"
  );

  if (!user) {
    next(AuthSerializer.serializeError("user_not_found"));
  }

  // google user
  if (user && !user.password) {
    next(AuthSerializer.serializeError("wrong_credentials"));
  }
  if (
    user &&
    !(await user.compareUserPassword(filterdData.password, user.password))
  ) {
    next(AuthSerializer.serializeError("wrong_credentials"));
  }
  res.status(200).json(AuthSerializer.serializeUserLogin(user, res));
});
// register
export const register = new CRUDService(
  User,
  ["full_name", "email", "password"],
  [],
  AuthSerializer.serializeUserRegister
).create;

// google authorization
export const googleAuthorization = (req, res, next) => {
  passport.authenticate("google", async (err, user) => {
    if (err || !user) {
      return res.redirect(`${process.env.CLIENT_URL}/login`);
    }

    try {
      const token = generateTokens(user, res);

      res.redirect(`${process.env.CLIENT_URL}?token=${token}`);
    } catch (error) {
      return res.redirect(`${process.env.CLIENT_URL}/login`);
    }
  })(req, res, next);
};
