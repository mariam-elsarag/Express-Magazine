import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema(
  {
    full_name: {
      type: String,
      required: [true, "Full name is required"],
      minlength: [3, "Full name should be at least 3 characters long"],
      maxlength: [50, "Full name should not exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      match: [
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        "Please enter a valid email address",
      ],
    },
    googleId: { type: String },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    avatar: {
      type: String,
    },
    cover_image: {
      type: String,
    },
    rating_quantity: {
      type: Number,
      default: 0,
    },
    rating_average: {
      type: Number,
      default: null,
      enum: [1, 2, 3, 4, 5],
      set: (val) => Math.round(val * 10) / 10,
    },
    followers: {
      type: Number,
      default: 0,
    },
    password: {
      type: String,
      required: [
        function () {
          return !this.googleId;
        },
        "Password is required",
      ],
      match: [
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
        "Week password",
      ],
      select: false,
    },

    password_changed_at: {
      type: Date,
      default: null,
      select: false,
    },
    otp_verified_token: {
      type: String,
      select: false,
    },
    otp: {
      type: String,
      default: null,
      select: false,
    },
    otp_expired_at: {
      type: Date,
      default: null,
      select: false,
    },
  },
  {
    toJSON: {
      transform: (doc, ret) => {
        ret.user_id = ret._id;

        delete ret._id;
        delete ret.id;
        delete ret.__v;
      },
    },
  }
);
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});
// to check user password
userSchema.methods.compareUserPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.checkChangePasswordAfterJWT = function (jwtTimestamp) {
  if (!this.password_changed_at) {
    return false;
  }
  const passwordChangedTime = Math.floor(
    this.password_changed_at.getTime() / 1000
  );
  return passwordChangedTime > jwtTimestamp;
};
// for generating otp
userSchema.methods.generateOTP = async function (expire = 10, user) {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const hashedOtp = await bcrypt.hash(otp, 12);
  user.otp = hashedOtp;
  user.otp_expired_at = Date.now() + expire * 60 * 1000;
  await user.save({ validateBeforeSave: false });
  return otp;
};
userSchema.methods.verifyOTP = async function (candidateOTP, savedOTP) {
  return await bcrypt.compare(candidateOTP, savedOTP);
};

//for one time token
userSchema.methods.generateToken = function (email) {
  return jwt.sign({ email }, process.env.JWT_SECRET_KEY_forget_password, {
    expiresIn: "1h",
  });
};
userSchema.statics.verifyForgetPasswordToken = async function (token) {
  const decoded = await jwt.verify(
    token,
    process.env.JWT_SECRET_KEY_forget_password
  );
  return decoded;
};
const User = mongoose.model("User", userSchema);
export default User;
