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
