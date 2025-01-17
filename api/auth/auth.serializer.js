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
  static serializeError(errorType) {
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
      default:
        errorMessage = "An error occurred";
        statusCode = 500;
        break;
    }

    const error = new appErrors(errorMessage, statusCode);
    return error;
  }
}

export default AuthSerializer;
