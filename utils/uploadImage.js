import cloudinary from "./../config/cloudinary.js";
import appErrors from "./appErrors.js";

export const uploadSingleImage = (fileBuffer, folderName, field) =>
  new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: folderName },
      (error, result) => {
        if (error) {
          if (
            error?.message?.includes(
              "File size too large. Got 15290999. Maximum is 10485760."
            )
          ) {
            return reject(
              new appErrors(
                {
                  [field]:
                    "File size too large. Got 14.58 MB. Maximum allowed is 10 MB.",
                },
                400
              )
            );
          } else {
            return reject(
              new appErrors({ [field]: "Failed to upload image" }, 500)
            );
          }
        }
        resolve(result.secure_url);
      }
    );
    uploadStream.end(fileBuffer);
  });

export const uploadMultipleImages = async (req, folderName, fields = []) => {
  const uploadedImages = {};

  for (const field of fields) {
    const file = req.files?.[field]?.[0];
    if (file) {
      uploadedImages[field] = await uploadSingleImage(
        file.buffer,
        folderName,
        field
      );
    }
  }

  return uploadedImages;
};

export const deleteSignleImage = async (item) => {
  try {
    const publicId = item
      .replace("https://res.cloudinary.com/dwlbskyfd/image/upload/", "") // Remove base URL
      .replace(/v\d+\//, "")
      .replace(/\.[^/.]+$/, "");
    const result = await cloudinary.api.delete_resources([publicId], {
      type: "upload",
      resource_type: "image",
    });
  } catch (err) {
    console.log("failed to delete image", err);
    return reject(new appErrors({ [field]: "Failed to delete image" }, 500));
  }
};
