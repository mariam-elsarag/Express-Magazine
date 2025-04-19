import ApiFeature from "../../utils/apiFeatures.js";
import appErrors from "../../utils/appErrors.js";
import asyncWraper from "../../utils/asyncWraper.js";
import serializeBody from "../../utils/serializeBody.js";
import { uploadMultipleImages } from "../../utils/uploadImage.js";
import Post from "../post/post.model.js";
import Rate from "../rating/rate.model.js";
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

// stat for posts rate
export const statForProfilePosts = asyncWraper(async (req, res, next) => {
  const user = req.user._id;

  try {
    const startOfYear = new Date(new Date().getFullYear(), 0, 1);

    // get all posts for this user that he made this year
    const userPosts = await Post.find({
      user,
      createdAt: { $gte: startOfYear },
    });

    const monthlyRates = {};

    await Promise.all(
      userPosts.map(async (post) => {
        const postId = post._id;

        // get all rates for the post
        const postRates = await Rate.find({ post: postId });

        postRates.forEach((rate) => {
          const rateDate = new Date(rate.createdAt);
          const month = rateDate.getMonth() + 1;
          if (!monthlyRates[month]) {
            monthlyRates[month] = [];
          }

          monthlyRates[month].push(rate.rate);
        });
      })
    );

    // Calculate monthly average from all rates
    const finalMonthlyRates = Object.keys(monthlyRates).map((month) => {
      const rates = monthlyRates[month];
      const avg = rates.reduce((sum, rate) => sum + rate, 0) / rates.length;
      return {
        month,
        averageRate: parseFloat(avg.toFixed(2)),
      };
    });

    res.status(200).json(finalMonthlyRates);
  } catch (err) {
    next(new appErrors(err, 500));
  }
});

// stati for posts views
export const statForPostsViews = asyncWraper(async (req, res, next) => {
  const user = req.user._id;
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const allUserPosts = await Post.find({ user });
  const data = new Array(12).fill(0);
  const currentYear = new Date().getFullYear().toString();
  allUserPosts.forEach((post) => {
    const viewsByMonth = post.viewsByMonth || new Map();
    for (const [key, value] of viewsByMonth.entries()) {
      if (key.startsWith(currentYear)) {
        const [, monthName] = key.split("-");
        const monthIndex = months.findIndex(
          (m) => m.toLowerCase() === monthName.toLowerCase()
        );

        if (monthIndex !== -1) {
          data[monthIndex] += value;
        }
      }
    }
  });
  res.status(200).json({ labels: months, data });
});
