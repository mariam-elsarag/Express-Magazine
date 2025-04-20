import Post from "../post/post.model.js";
import Comment from "./comment.model.js";
// utils
import asyncWraper from "../../utils/asyncWraper.js";
import appErrors from "../../utils/appErrors.js";
import serializeBody from "../../utils/serializeBody.js";
import ApiFeature from "../../utils/apiFeatures.js";

// create new comment
export const createComment = asyncWraper(async (req, res, next) => {
  const user = req.user._id;
  const { postId } = req.params;
  const requiredField = ["content"];
  const filterData = serializeBody(req.body, next, requiredField);

  if (!filterData) {
    return;
  }
  // check if this post exist
  const post = await Post.findById(postId);
  if (!post) {
    return next(new appErrors("Post not found", 400));
  }
  const comment = await Comment.create({
    post: postId,
    user,
    content: filterData.content,
  });
  res.status(201).json(comment);
});
// get comment list
export const commentList = asyncWraper(async (req, res, next) => {
  const { postId } = req.params;
  const features = new ApiFeature(
    Comment.find({ post: postId }).populate({
      path: "user",
      select: "full_name avatar _id",
    }),
    req.query
  )
    .paginate(20)

    .sort("createdAt:desc");

  const comments = await features.getPaginations(Comment, req);
  res.status(200).json(comments);
});
