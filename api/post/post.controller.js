import Post from "./post.model.js";
// utils
import appErrors from "../../utils/appErrors.js";
import asyncWraper from "../../utils/asyncWraper.js";
import serializeBody from "../../utils/serializeBody.js";
import uploadImage from "../../utils/uploadImage.js";
import ApiFeature from "../../utils/apiFeatures.js";

// create new post
export const createPost = asyncWraper(async (req, res, next) => {
  const required = ["title", "description", "summary", "category"];
  const allowedFields = ["tags"];
  const filterData = serializeBody(req.body, next, required, allowedFields);
  const user = req.user;
  if (!user) return next(new appErrors([{ user: "User is required" }], 401));
  filterData.user = user._id;
  if (!filterData) {
    return;
  }
  if (!req.file) {
    return next(new appErrors([{ image: "Image is required" }], 400));
  } else {
    filterData.image = await uploadImage(req, "/mediafiles/posts", "image");
  }
  const post = await Post.create(filterData);
  res.status(201).json(post);
});

// update post
export const updatePost = asyncWraper(async (req, res, next) => {
  const allowedFields = ["title", "description", "tags", "summary", "category"];
  const filterData = serializeBody(req.body, next, [], allowedFields);
  if (!filterData) {
    return;
  }
  const { id } = req.params;
  const post = await Post.findById(id);
  if (!post) return next(new appErrors("Post not found", 404));
  if (req.file) {
    filterData.image = await uploadImage(req, "/mediafiles/posts", "image");
  }
  Object.keys(filterData).forEach((key) => {
    post[key] = filterData[key];
  });
  const updatedPost = await post.save();
  res.status(200).json(updatedPost);
});

// get all users posts
export const getUsersPosts = asyncWraper(async (req, res, next) => {
  const user = req.user._id;
  console.log(user, "user");
  const features = new ApiFeature(
    Post.find({ user }).populate({ path: "user", select: "avatar full_name" }),
    req.query
  )
    .paginate(12)
    .sort("createdAt:acs");
  const posts = await features.getPaginations(Post, req);
  posts.results = posts?.results?.map((post) => ({
    user: {
      avatar: post.user.avatar,
      full_name: post.user.full_name,
      user_id: post.user._id,
    },
    title: post.title,
    image: post.image,
    views: post.views,
    rating: post.rating_average,
    post_id: post._id,
  }));

  res.status(200).json(posts);
});

// view post
export const viewPost = asyncWraper(async (req, res, next) => {
  const { id } = req.params;
  const post = await Post.findByIdAndUpdate(id, {
    $inc: { views: 1 },
  });
  if (!post) return next(new appErrors("Post not found", 404));
  res.status(200).json({ message: "Post updated" });
});
