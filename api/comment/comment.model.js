import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    post: {
      type: mongoose.Schema.ObjectId,
      ref: "Post",
      required: [true, "Post is required"],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      require: [true, "User is required"],
    },
    content: {
      type: String,
      required: [true, "Content is required"],
    },
  },
  {
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.commentId = ret._id;
        delete ret._id;
        delete ret.id;
        delete ret.__v;
      },
    },
  }
);

commentSchema.pre("save", function (next) {
  this.populate({
    path: "user",
    select: "full_name avatar",
  });

  next();
});
const Comment = mongoose.model("Comment", commentSchema);
export default Comment;
