import Save from "./save.model.js";

// utils
import asyncWraper from "../../utils/asyncWraper.js";

export const toggleSaved = asyncWraper(async (req, res, next) => {
  const { postId: post } = req.params;
  const user = req.user._id;
  const savedPost = await Save.findOne({ post, user });
  if (savedPost) {
    await Save.deleteOne({ post, user });
    return res.status(200).json({ saved: false });
  } else {
    await Save.create({ post, user });
    return res.status(200).json({ saved: true });
  }
});

// get saved posts
export const getUserSavedPosts = asyncWraper(async (req, res, next) => {
  const user = req.user._id;
  const { postId: post } = req.params;
});
