import appErrors from "./appErrors.js";

const serializeBody = (body, next, requiredFields = [], allowFields = []) => {
  let errors = [];
  let filter = {};
  // to put in filte data
  Object.keys(body).forEach((bodyElement) => {
    if (
      allowFields.includes(bodyElement) ||
      requiredFields.includes(bodyElement)
    ) {
      filter[bodyElement] = body[bodyElement];
    }
  });

  // to check missing fields
  requiredFields.forEach((field) => {
    if (!filter[field]) {
      errors.push({ [field]: `${field} is required` });
    }
  });

  if (errors.length > 0) {
    next(new appErrors(errors, 400));
    return null;
  } else {
    return filter;
  }
};
export default serializeBody;
