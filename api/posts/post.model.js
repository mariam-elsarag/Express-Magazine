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
  { timeseries: true }
);
const Post = mongoose.model("Post", postSchema);

export default Post;
