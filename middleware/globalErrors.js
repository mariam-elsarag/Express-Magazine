import appErrors from "../utils/appErrors.js";

// JWT error handlers
const handleJWTError = () => new appErrors("Invalid token", 401);
const handleExpireJWTError = () =>
  new appErrors("Your token has expired!", 401);

// Invalid MongoDB ID
const handleInvalidId = () => new appErrors("Invalid ID", 400);

// Duplicate key error (e.g. title or email)
const handleDublicateDbData = (err) => {
  if (err.code === 11000) {
    let field = Object.keys(err.keyPattern)[0];
    return new appErrors(
      `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`,
      400
    );
  }
  return new appErrors(err.message, 400);
};

// Mongoose validation error
const handleValidationError = (err) => {
  let errors = [];

  if (err.errors) {
    const errorFields = err.errors;
    Object.keys(errorFields).forEach((key) => {
      errors.push({ [key]: errorFields[key].properties.message });
    });
  }

  if (errors.length > 0) {
    return new appErrors(errors, 400);
  }

  return new appErrors("Validation error", 400);
};

// Cloudinary-specific error (custom)
const handleCloudinaryError = (err) => {
  return new appErrors(err.message, 500);
};

// Production error handler (minimal response)
const handleProductionErrors = (err, res) => {
  res.status(err.statusCode).json({ errors: err.message });
};

// Development error handler (detailed)
const handleDevErrors = (err, res) => {
  res.status(err.statusCode).json({
    errors: err.message,
    error_details: err.errors,
    stack: err.stack,
  });
};

// Main global error handler middleware
const globalErrors = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;

  if (process.env.NODE_ENV === "production") {
    let error = { ...err };
    error.message = err.message;

    if (
      typeof error.message === "string" &&
      error.message.includes("Cast to ObjectId failed")
    ) {
      error = handleInvalidId();
    }

    if (
      error.code === 11000 ||
      (typeof error.message === "string" && error.message.includes("unique"))
    ) {
      error = handleDublicateDbData(err);
    }

    // JWT
    if (
      error.name === "JsonWebTokenError" ||
      error.message === "invalid signature"
    ) {
      error = handleJWTError();
    }

    // Expired JWT
    if (error.name === "TokenExpiredError") {
      error = handleExpireJWTError();
    }

    // Mongoose validation
    if (
      error.errors?.email?.name === "ValidatorError" ||
      error.errors?.password?.path === "password"
    ) {
      error = handleValidationError(error);
    }

    // Cloudinary image upload failure
    if (
      typeof error.message === "object" &&
      error.message?.image?.includes("Failed to upload image")
    ) {
      error = handleCloudinaryError(error);
    }

    handleProductionErrors(error, res);
  } else {
    handleDevErrors(err, res);
  }

  next();
};

export default globalErrors;
