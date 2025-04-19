import Rate from "./rate.model.js";
// utils
import asyncWraper from "../../utils/asyncWraper.js";
import serializeBody from "../../utils/serializeBody.js";
import Post from "../post/post.model.js";
import appErrors from "../../utils/appErrors.js";

export const createPostRate = asyncWraper(async (req, res, next) => {
  const required = ["rate"];
  const { id: post_id } = req.params;
  const user = req.user._id;
  const filterData = serializeBody(req.body, next, required);
  if (!user) return next(new Error("User is required"));
  if (!filterData) return;
  const isRatedPost = await Rate.findOne({ post: post_id, user });
  if (isRatedPost) {
    return next(new Error("You have already rated this post", 409));
  }
  await Rate.create({
    post: post_id,
    user,
    rate: filterData.rate,
  });

  res.status(201).json({ message: "Successfully rated this post" });
});
