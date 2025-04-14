import ApiFeature from "../../utils/apiFeatures.js";
import appErrors from "../../utils/appErrors.js";
import asyncWraper from "../../utils/asyncWraper.js";
import serializeBody from "../../utils/serializeBody.js";
import { uploadMultipleImages } from "../../utils/uploadImage.js";
import Post from "../post/post.model.js";
import User from "./user.model.js";

export const userData = asyncWraper(async (req, res, next) => {
  const { id } = req.params;
  const user = await User.findById(id);
  if (!user) {
    return next(new appErrors("User no longer exist", 404));
  }
  const userPosts = await Post.countDocuments(Post.find({ user: user._id }));

  res.status(200).json({
    userId: user._id,
    full_name: user.full_name,
    avatar: user.avatar,
    cover_image: user.cover_image,
    avg_rate: user.rating_average || 0,
    followers: user.followers,
    posts_count: userPosts,
  });
});

export const getUserPosts = asyncWraper(async (req, res, next) => {
  const { id } = req.params;
  const user = await User.findById(id);
  if (!user) {
    return next(new appErrors("User no longer exist", 404));
  }
  const features = new ApiFeature(Post.find({ user: id }), req.query)
    .paginate(12)
    .sort("createdAt:acs");
  const posts = await features.getPaginations(Post, req);
  posts.results = posts?.results?.map((post) => ({
    post_id: post._id,
    title: post.title,
    image: post.image,
    views: post.views,
    rating: post.rating_average,
  }));

  res.status(200).json(posts);
});

// to get profile data
export const profileData = asyncWraper(async (req, res, next) => {
  const user = req.user;
  res.status(200).json({
    userId: user._id,
    full_name: user.full_name,
    avatar: user.avatar || null,
    cover_image: user.cover_image || null,
  });
});

// update profile data
export const updateProfileData = asyncWraper(async (req, res, next) => {
  const user = req.user._id;
  const allowedFields = ["full_name"];
  const filterData = serializeBody(req.body, next, [], allowedFields);
  let data;
  if (req.files) {
    data = await uploadMultipleImages(req, "/mediafiles/profile", [
      "avatar",
      "cover_image",
    ]);
    if (data?.avatar) {
      filterData.avatar = data.avatar;
    }
    if (data.cover_image) {
      filterData.cover_image = data.cover_image;
    }
  }
  let userInfo;
  if (Object.keys(filterData).length > 0) {
    userInfo = await filterData.save({ ValidityState: false });
  }
  res.status(200).json({});
});

// get user posts
export const myPosts = asyncWraper(async (req, res, next) => {
  const user = req.user._id;
  const userPosts = await Post.find({ user })
    .limit(4)
    .sort({ createdAt: -1 })
    .populate({ path: "category", select: "title" });
  const adjustData = userPosts.map((post) => {
    return {
      post_id: post._id,

      category: {
        title: post.category.title,
      },
      title: post.title,
      image: post.image,
      views: post.views,
      rating: post.rating_average,
    };
  });
  res.status(200).json(adjustData);
});
