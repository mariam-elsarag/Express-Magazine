import mongoose from "mongoose";
import Post from "../posts/post.model";

const rateSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
    },
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: [true, "Post is required"],
    },
    rate: {
      type: Number,
      required: [true, "Rate is required"],
      enum: [1, 2, 3, 4, 5],
    },
  },
  { timestamps: true },
  {
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.rate_id = ret._id;
        delete ret._id;
        delete ret.id;
        delete ret.__v;
      },
    },
  }
);
rateSchema.statics.calcAverage = async function (postId) {
  const rateStat = await this.aggregate([
    {
      $match: { post: postId },
    },
    {
      $group: {
        _id: "$post",
        count: { $sum: 1 },
        averageRate: { $avg: "$rate" },
      },
    },
  ]);
  if (rateStat.length > 0) {
    await Post.findByIdAndUpdate(postId, {
      rating_quentity: rateStat[0].count,
      average_rating: rateStat[0].averageRate,
    });
  } else {
    await Post.findByIdAndUpdate(postId, {
      rating_quentity: 0,
      average_rating: 0,
    });
  }
};

const Rate = mongoose.model("Rate", rateSchema);

export default Rate;
