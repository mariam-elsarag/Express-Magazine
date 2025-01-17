import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema({
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
  googleId: { type: String, unique: true },
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
  is_otp_verified: {
    type: Boolean,
    default: false,
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
});
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
const User = mongoose.model("User", userSchema);
export default User;
