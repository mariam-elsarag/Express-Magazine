import appErrors from "../../utils/appErrors.js";
import serializeBody from "../../utils/serializeBody.js";
import { deleteCategory } from "./category.controller.js";

class CategorySerizlizer {
  static async deleteCategory(req) {
    const { id } = req.params;
  }
}

export default CategorySerizlizer;
