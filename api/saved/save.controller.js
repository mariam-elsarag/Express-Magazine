import Save from "./save.model.js";

// utils
import asyncWraper from "../../utils/asyncWraper.js";
import ApiFeature from "../../utils/apiFeatures.js";

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
export const userSavedPosts = asyncWraper(async (req, res, next) => {
  const user = req.user._id;
  const featurs = new ApiFeature(Save.find({ user }), req.query).paginate(12);

  const savedPosts = await featurs.getPaginations(Save, req);
  savedPosts.results = savedPosts?.results?.map((post) => ({
    ...post.toJSON(),
    is_saved: true,
  }));
  res.status(200).json(savedPosts);
});
