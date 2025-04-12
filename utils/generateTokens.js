import jwt from "jsonwebtoken";
import appErrors from "./appErrors.js";
export const generateTokens = async (user, res) => {
  try {
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET_KEY,
      {
        expiresIn: process.env.JWT_EXPIRE_IN,
      }
    );
    res.cookie("magazine_token", token, {
      httpOnly: true,
      sameSite: "strict",
      maxAge: 15 * 24 * 60 * 60 * 1000,
    });
    return token;
  } catch (err) {
    throw new appErrors("Can't generate token", 500);
  }
};
