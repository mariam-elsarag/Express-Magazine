import axios from "axios";
import asyncWraper from "../../utils/asyncWraper.js";
import Post from "../post/post.model.js";
import ApiFeature from "../../utils/apiFeatures.js";

// popular posts
export const popularPosts = asyncWraper(async (req, res, next) => {
  const currentYear = new Date().getFullYear();
  const monthName = new Date().toLocaleString("default", { month: "long" });
  const field = `viewsByMonth.${currentYear}-${monthName}`;
  const features = new ApiFeature(
    Post.find({ views: { $gt: 0 } }).populate({
      path: "user",
      select: "full_name avatar _id",
    }),
    req.query
  )
    .paginate(4)
    .sort(`${field}:desc`);
  const posts = await features.getPaginations(Post, req);
  posts.results = posts?.results?.map((post) => ({
    user: {
      full_name: post.user.full_name,
      avatar: post.user.avatar,
      userId: post.user._id,
    },
    post_id: post._id,
    title: post.title,
    image: post.image,
    views: post.views,
    rating: post.rating_average,
    createdAt: new Date(post.createdAt).toLocaleDateString("en-us", {
      month: "long",
      day: "numeric",
      year: "numeric",
    }),
  }));

  res.status(200).json(posts);
});
