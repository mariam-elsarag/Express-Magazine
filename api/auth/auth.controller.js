import User from "../profile/user.model.js";
// utils
import { generateTokens } from "../../utils/generateTokens.js";
import serializeBody from "../../utils/serializeBody.js";
import asyncWraper from "./../../utils/asyncWraper.js";
import appErrors from "../../utils/appErrors.js";
import CRUDService from "../../service/CRUDService.js";

import Email from "./../../utils/sendEmail.js";

// for google
import passport from "../../config/passport.js";
import extractAuthorization from "../../utils/extractHeader.js";

// check if user exist
const checkUserExist = async (userModel, email, next) => {
  try {
    const userData = await userModel
      .findOne({ email })
      .select("email full_name otp otp_expired_at otp_verified_token password");
    if (!userData) {
      return next(new appErrors("User not found", 404));
    }
    return userData;
  } catch (error) {
    console.log("error form check user in auth", error);
    return next(new appErrors("User not found", 404));
  }
};

// login
export const login = asyncWraper(async (req, res, next) => {
  const requiredFields = ["email", "password"];
  const filterdData = serializeBody(req.body, next, requiredFields);
  const user = await User.findOne({ email: filterdData.email }).select(
    "password email full_name role avatar"
  );

  if (!user) {
    return next(new appErrors("User not found", 404));
  }

  // google user
  if (user && !user.password) {
    return next(new appErrors("Wrong credentials", 401));
  }
  if (
    user &&
    !(await user.compareUserPassword(filterdData.password, user.password))
  ) {
    return next(new appErrors("Wrong credentials", 401));
  }
  const token = await generateTokens(user, res);

  res.status(200).json({
    userId: user._id,
    full_name: user.full_name,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
    token: token,
  });
});
// register
const serializeUserRegister = (user) => {
  (user.avatar = `https://avatar.iran.liara.run/username?username=${user.full_name}`),
    user.save({ validateBeforeSave: false });
  return {
    full_name: user.full_name,
    email: user.email,
    role: user.role,
    avatar: `https://avatar.iran.liara.run/username?username=${user.full_name}`,
  };
};
export const register = new CRUDService(
  User,
  ["full_name", "email", "password"],
  [],
  serializeUserRegister
).create;

// google authorization
export const googleAuthorization = (req, res, next) => {
  passport.authenticate("google", async (err, user) => {
    if (err || !user) {
      return res.redirect(`${process.env.CLIENT_URL}/login`);
    }

    try {
      const token = await generateTokens(user, res);
      res.cookie("token", user.token, {
        maxAge: 15 * 24 * 60 * 60 * 1000,
      });
      res.cookie("full_name", user.full_name, {
        maxAge: 15 * 24 * 60 * 60 * 1000,
      });
      res.cookie("avatar", user.avatar, {
        maxAge: 15 * 24 * 60 * 60 * 1000,
      });
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
  const user = await checkUserExist(User, filterdData.email, next);

  if (!user) return;
  try {
    const otp = await user.generateOTP(10, user);

    const resetLink = `${process.env.CLIENT_URL}/otp?email=${filterdData.email}`;
    await new Email(user, resetLink, otp).sendResetEmail();
    res.status(200).json({ message: "successfully send Otp" });
  } catch (err) {
    user.otp = undefined;
    user.otp_expired_at = undefined;
    return next(
      new appErrors(
        "There was an error while sending the email. Try again later",
        500
      )
    );
  }
});

// verify otp
export const verifyOtp = asyncWraper(async (req, res, next) => {
  const requiredFields = ["email", "otp"];
  const filterdData = serializeBody(req.body, next, requiredFields);
  const user = await checkUserExist(User, filterdData.email, next);

  if (!user) return;
  if (!user.otp) {
    return next(new appErrors("Invalid OTP", 401));
  }
  const isVerified = await user.verifyOTP(filterdData.otp, user.otp);
  if (!isVerified) {
    return next(new appErrors("Invalid OTP", 401));
  }

  if (user.otp_expired_at.getTime() < Date.now()) {
    return next(new appErrors("OTP expired"));
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
    return next(new appErrors("Invalid OTP", 401));
  }
});

export const resetPassword = asyncWraper(async (req, res, next) => {
  const requiredFields = ["password"];
  const filterdData = serializeBody(req.body, next, requiredFields);
  const token = extractAuthorization(req);
  if (!token || token == "null") {
    return next(new appErrors("Token required", 401));
  }
  const decode = await User.verifyForgetPasswordToken(token);

  const user = await checkUserExist(User, decode.email, next);
  if (!user) return;

  if (!user.otp_verified_token) {
    return next(new appErrors("OTP not verified", 401));
  }

  if (user.otp_verified_token !== token) {
    return next(new appErrors("OTP not verified", 401));
  }
  user.otp_verified_token = undefined;
  user.password = filterdData.password;
  user.password_changed_at = Date.now();
  await user.save();
  res.status(200).json({ message: "Successfuly change password " });
});
