import cloudinary from "./../config/cloudinary.js";
import appErrors from "./appErrors.js";
const uploadImage = (req, folderName, field) =>
  new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: folderName },
      (error, result) => {
        if (error) {
          return reject(
            new appErrors({ [field]: "Failed to upload image" }, 500)
          );
        }
        resolve(result.secure_url);
      }
    );
    uploadStream.end(req.file.buffer);
  });

export default uploadImage;
