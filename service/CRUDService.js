import appErrors from "../utils/appErrors.js";
import serializeBody from "../utils/serializeBody.js";
import asyncWraper from "./../utils/asyncWraper.js";
class CRUDService {
  constructor(model, requiredFields, allowedFields, serializeData) {
    this.model = model;
    this.requiredFields = requiredFields;
    this.allowedFields = allowedFields;
    this.serializeData = serializeData;
  }
  create = asyncWraper(async (req, res, next) => {
    const filterdData = serializeBody(
      req.body,
      next,
      this.requiredFields,
      this.allowedFields
    );
    const doc = await this.model.create(filterdData);
    res.status(201).json(this.serializeData(doc));
  });
  update = asyncWraper(async (req, res, next) => {
    const filteredData = serializeBody(req.body, next, [], this.allowedFields);
    const doc = await this.model.findByIdAndUpdate(
      req.params.id,
      filteredData,
      {
        new: true,
        runValidators: true,
      }
    );
    if (!doc) {
      return next(new appErrors("Not found", 404));
    }
    res.status(200).json(this.serializeData(doc));
  });
  delete = asyncWraper(async (req, res, next) => {
    const doc = await this.model.findByIdAndDelete(req.params.id);
    if (!doc) {
      return next(new appErrors("Not found", 404));
    }
    res.status(204).json(this.serializeData(doc));
  });

  get = asyncWraper(async (req, res, next) => {
    const doc = await this.model.findById(req.params.id);
    if (!doc) {
      return next(new appErrors("Not found", 404));
    }
    res.status(200).json(this.serializeData(doc));
  });
  getAll = asyncWraper(async (req, res, next) => {
    const docs = await this.model.find();
    res.status(200).json(this.serializeData(doc));
  });
}
export default CRUDService;
