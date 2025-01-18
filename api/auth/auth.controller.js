import User from "../profile/user.model.js";
// utils
import { generateTokens } from "../../utils/generateTokens.js";
import serializeBody from "../../utils/serializeBody.js";
import asyncWraper from "./../../utils/asyncWraper.js";
import appErrors from "../../utils/appErrors.js";
import CRUDService from "../../service/CRUDService.js";
import AuthSerializer from "./auth.serializer.js";
import Email from "./../../utils/sendEmail.js";

// for google
import passport from "../../config/passport.js";
import extractAuthorization from "../../utils/extractHeader.js";

// login
export const login = asyncWraper(async (req, res, next) => {
  const requiredFields = ["email", "password"];
  const filterdData = serializeBody(req.body, next, requiredFields);
  const user = await User.findOne({ email: filterdData.email }).select(
    "password email full_name role"
  );

  if (!user) {
    return AuthSerializer.serializeError("user_not_found", next);
  }

  // google user
  if (user && !user.password) {
    return AuthSerializer.serializeError("wrong_credentials", next);
  }
  if (
    user &&
    !(await user.compareUserPassword(filterdData.password, user.password))
  ) {
    return AuthSerializer.serializeError("wrong_credentials", next);
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

// forget password
export const forgetPassword = asyncWraper(async (req, res, next) => {
  const requiredFields = ["email"];
  const filterdData = serializeBody(req.body, next, requiredFields);
  const user = await AuthSerializer.serializeUserExist(
    User,
    filterdData.email,
    next
  );

  if (!user) return;
  try {
    const otp = await user.generateOTP(10, user);

    const resetLink = `${process.env.CLIENT_URL}/otp?email=${filterdData.email}`;
    await new Email(user, resetLink, otp).sendResetEmail();
    res.status(200).json({ message: "successfully send Otp" });
  } catch (err) {
    user.otp = undefined;
    user.otp_expired_at = undefined;
    AuthSerializer.serializeError("sending_email", next);
  }
});

// verify otp
export const verifyOtp = asyncWraper(async (req, res, next) => {
  const requiredFields = ["email", "otp"];
  const filterdData = serializeBody(req.body, next, requiredFields);
  const user = await AuthSerializer.serializeUserExist(
    User,
    filterdData.email,
    next
  );

  if (!user) return;
  if (!user.otp) {
    return AuthSerializer.serializeError("invalid_otp", next);
  }
  const isVerified = await user.verifyOTP(filterdData.otp, user.otp);
  if (!isVerified) {
    return AuthSerializer.serializeError("invalid_otp", next);
  }

  if (user.otp_expired_at.getTime() < Date.now()) {
    return AuthSerializer.serializeError("otp_expired", next);
  }
  try {
    const token = await user.generateToken(filterdData.email);
    user.otp = undefined;
    user.otp_expired_at = undefined;
    user.otp_verified_token = token;
    await user.save({ validateBeforeSave: false });
    res.status(200).json({
      message: "Otp verified successfully",
      token: token,
    });
  } catch (err) {
    return AuthSerializer.serializeError("invalid_otp", next);
  }
});

export const resetPassword = asyncWraper(async (req, res, next) => {
  const requiredFields = ["password"];
  const filterdData = serializeBody(req.body, next, requiredFields);
  const token = extractAuthorization(req);
  if (!token || token == "null") {
    return AuthSerializer.serializeError("required_token", next);
  }
  const decode = await User.verifyForgetPasswordToken(token);

  const user = await AuthSerializer.serializeUserExist(
    User,
    decode.email,
    next
  );
  if (!user) return;

  if (!user.otp_verified_token) {
    return AuthSerializer.serializeError("otp_not_verified", next);
  }

  if (user.otp_verified_token !== token) {
    return AuthSerializer.serializeError("otp_not_verified", next);
  }
  user.otp_verified_token = undefined;
  user.password = filterdData.password;
  user.password_changed_at = Date.now();
  await user.save();
  res.status(200).json({ message: "Successfuly change password " });
});
