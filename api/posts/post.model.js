import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is requred"],
    },
    title: {
      type: String,
      required: [true, "Title is required"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
    },
    summary: {
      type: String,
      required: [true, "Summary is required"],
    },
    image: {
      type: String,
      required: [true, "Image is required"],
    },
    tags: [{ type: String }],
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category is required"],
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.post_id = ret._id;
        delete ret._id;
        delete ret.id;
        delete ret.__v;
      },
    },
  }
);
// postSchema.pre("save", function (next) {
//   this.populate({
//     path: "user",
//     select: "full_name avatar",
//   });
//   this.populate({
//     path: "category",
//     select: "title",
//   });
//   next();
// });
const Post = mongoose.model("Post", postSchema);

export default Post;
