// utils
import cloudinary from "./../config/cloudinary.js";
import appErrors from "./appErrors.js";

const deleteOneFromCloudinary = async (item) => {
  try {
    const publicId = item
      .replace("https://res.cloudinary.com/dwlbskyfd/image/upload/", "") // Remove base URL
      .replace(/v\d+\//, "")
      .replace(/\.[^/.]+$/, "");

    const result = await cloudinary.api.delete_resources([publicId], {
      type: "upload",
      resource_type: "image",
    });
    console.log(result, "kkk");
    return null;
  } catch (error) {
    console.log(error);
    return "Error deleting image from Cloudinary";
  }
};

export default deleteOneFromCloudinary;
