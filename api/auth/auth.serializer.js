import appErrors from "../../utils/appErrors.js";
import { generateTokens } from "../../utils/generateTokens.js";

class AuthSerializer {
  static serializeUserRegister(user) {
    return {
      full_name: user.full_name,
      email: user.email,
      role: user.role,
    };
  }

  static serializeUserLogin(user, res) {
    const token = generateTokens(user, res);
    return {
      userId: user._id,
      full_name: user.full_name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      token: token,
    };
  }
  static async serializeUserExist(userModel, email, next) {
    try {
      const userData = await userModel
        .findOne({ email })
        .select(
          "email full_name otp otp_expired_at otp_verified_token password"
        );
      if (!userData) {
        return this.serializeError("user_not_found", next);
      }
      return userData;
    } catch (error) {
      return this.serializeError("", next);
    }
  }

  static serializeError(errorType, next) {
    let errorMessage = "An error occurred";
    let statusCode = 500;

    switch (errorType) {
      case "wrong_credentials":
        errorMessage = "Wrong credentials";
        statusCode = 401;
        break;
      case "user_not_found":
        errorMessage = "User not found";
        statusCode = 404;
        break;
      case "sending_email":
        errorMessage =
          "There was an error while sending the email. Try again later";
        statusCode = 500;
        break;
      case "invalid_otp":
        errorMessage = "Invalid OTP";
        statusCode = 401;
        break;
      case "otp_expired":
        errorMessage = "OTP expired";
        statusCode = 401;
        break;
      case "otp_not_verified":
        errorMessage = "OTP not verified";
        statusCode = 401;
        break;
      case "access_denied":
        errorMessage = "Unauthorized: Access is denied";
        statusCode = 401;
        break;
      case "required_token":
        errorMessage = "Token required";
        statusCode = 401;
        break;
      default:
        errorMessage = "An error occurred";
        statusCode = 500;
        break;
    }

    const error = new appErrors(errorMessage, statusCode);
    return next(error);
  }
}

export default AuthSerializer;
