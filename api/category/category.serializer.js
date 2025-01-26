import appErrors from "../../utils/appErrors.js";
import serializeBody from "../../utils/serializeBody.js";

class CategorySerizlizer {
  createCateory(req, res, next) {
    const requiredFields = ["title"];
    const filterdData = serializeBody(req.body, next, requiredFields);
    if (!req.file) {
      return next(new appErrors("category image is required", 400));
    }
  }
}
