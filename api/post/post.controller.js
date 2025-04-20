import Post from "./post.model.js";
// utils
import appErrors from "../../utils/appErrors.js";
import asyncWraper from "../../utils/asyncWraper.js";
import serializeBody from "../../utils/serializeBody.js";
import {
  deleteSignleImage,
  uploadSingleImage,
} from "../../utils/uploadImage.js";

import { getViewCache, setViewCache } from "../../config/cashManager.js";

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
    try {
      filterData.image = await uploadSingleImage(
        req.file.buffer,
        "/mediafiles/posts",
        "image"
      );
    } catch (err) {
      throw err;
    }
  }
  const post = await Post.create(filterData);
  res.status(201).json({
    post_id: post._id,
    user: {
      avatar: post.user.avatar,
      full_name: post.user.full_name,
      user_id: post.user._id,
    },
    category: {
      title: post.category.title,
    },
    title: post.title,
    image: post.image,
    views: post.views,
    rating: post.rating_average,
    tags: post.tags?.length > 0 ? post.tags : null,
  });
});

// update post
export const updatePost = asyncWraper(async (req, res, next) => {
  const user = req.user._id;
  const allowedFields = ["title", "description", "tags", "summary", "category"];
  const filterData = serializeBody(req.body, next, [], allowedFields);
  if (!filterData) {
    return;
  }
  const { id } = req.params;
  const post = await Post.findOne({ user: user, _id: id }).populate([
    {
      path: "user",
      select: "full_name avatar _id",
    },
    { path: "category", select: "title _id" },
  ]);
  if (!post) return next(new appErrors("Post not found", 404));
  if (req.file) {
    await deleteSignleImage(post.image);
    filterData.image = await uploadSingleImage(
      req.file.buffer,
      "/mediafiles/posts",
      "image"
    );
  }

  if (Object.keys(filterData)?.length > 0) {
    Object.keys(filterData).forEach((key) => {
      post[key] = filterData[key];
    });
    const updatedPost = await post.save();
    res.status(200).json({
      post_id: updatedPost._id,
      user: {
        full_name: updatedPost.user.full_name,
        avatar: updatedPost.user.avatar,
        user_id: updatedPost.user._id,
      },
      category: {
        categoryId: updatedPost.category._id,
        title: updatedPost.category.title,
      },
      title: updatedPost.title,
      image: updatedPost.image,
      tags: updatedPost.tags?.length > 0 ? updatedPost.tags : null,
    });
  } else {
    res.status(200).json({
      post_id: post._id,
      user: {
        full_name: post.user.full_name,
        avatar: post.user.avatar,
        user_id: post.user._id,
      },
      category: {
        categoryId: post.category._id,
        title: post.category.title,
      },
      title: post.title,
      image: post.image,
      tags: post.tags?.length > 0 ? post.tags : null,
    });
  }
});

// view post
export const viewPost = asyncWraper(async (req, res, next) => {
  const { id } = req.params;
  const userIp = req.ip;
  const key = `viewed:${id}:${userIp}`;
  const cachedAt = getViewCache(key);

  const now = Date.now();
  if (cachedAt && now - cachedAt < 3600000) {
    return res.status(200).json({ message: "View already counted recently" });
  }

  setViewCache(key, now);

  const date = new Date();
  const year = date.getFullYear();
  const monthName = date.toLocaleString("default", { month: "long" });
  const yearMonth = `${year}-${monthName}`;

  const post = await Post.findByIdAndUpdate(
    id,
    {
      $inc: {
        [`viewsByMonth.${yearMonth}`]: 1,
        views: 1,
      },
    },
    { new: true }
  );

  if (!post) return next(new appErrors("Post not found", 404));
  const currentYear = new Date().getFullYear().toString();
  if (post.viewsByMonth instanceof Map) {
    for (const [key, value] of post.viewsByMonth.entries()) {
      if (key < currentYear) {
        post.viewsByMonth.delete(key);
      }
    }
  }
  await post.save();
  res.status(200).json({ message: "Post updated", views: post.views });
});
