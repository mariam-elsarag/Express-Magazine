import mongoose from "mongoose";
const saveSchema = new mongoose.Schema(
  {
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    toJSON: {
      transform: (doc, ret) => {
        ret.saveId = ret._id;
        delete ret._id;
        delete ret.id;
        delete ret.__v;
      },
    },
  }
);

saveSchema.pre("find", function (next) {
  this.populate({
    path: "user",
    select: "full_name avatar",
  });
  this.populate({
    path: "post",
    select: "title summary image createdAt",
  });
  next();
});
const Save = mongoose.model("Save", saveSchema);

export default Save;
