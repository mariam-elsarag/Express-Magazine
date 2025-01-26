import appErrors from "../utils/appErrors.js";

// jwt errors
const handleJWTError = () => {
  return new appErrors("Invalid token", 401);
};
const handleExpireJWTError = () => {
  return new appErrors("Your token has expired!", 401);
};

// Database errors
// unique data
const handleDublicateDbData = (err) => {
  if (err.code === 11000) {
    let field = "";

    if (err.keyPattern.title) {
      field = "title";
    }
    if (err.keyPattern.email) {
      field = "email";
    }

    return new appErrors(
      `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`,
      400
    );
  } else {
    return new appErrors(err.message, 400);
  }
};

// validation errors
const handleValidationError = (err, res) => {
  let errors = [];
  if (err.errors) {
    const errorsObject = err.errors;

    Object.keys(errorsObject).forEach((key) => {
      errors.push({ [key]: errorsObject[key].properties.message });
    });
  }

  if (errors?.length > 0) {
    return new appErrors(errors, 400);
  }
};
// for producation errors
const handleProducationErrors = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({ errors: err.message });
  } else {
    res.status(err.statusCode).json({ errors: "something went wrong" });
  }
};
// for development errors
const handleDevErrors = (err, res) => {
  res.status(err.statusCode).json({
    message: err.message,
    errors: err.errors,
  });
};

const globalErrors = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  if (process.env.NODE_ENV === "production") {
    let error = err;

    if (err.code === 11000 || error?.message?.includes("unique")) {
      error = handleDublicateDbData(err);
    }
    if (
      error?.name === "JsonWebTokenError" ||
      error?.name === "invalid signature"
    ) {
      error = handleJWTError();
    }
    if (
      error?.errors?.email?.name === "ValidatorError" ||
      error?.errors?.password?.path == "password"
    ) {
      error = handleValidationError(error, res);
    }

    if (error.name === "TokenExpiredError") error = handleExpireJWTError();
    handleProducationErrors(error, res);
  } else {
    handleDevErrors(err, res);
  }
  next();
};
export default globalErrors;
