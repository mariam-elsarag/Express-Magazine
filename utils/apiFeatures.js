class ApiFeature {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }
  filter() {
    const queryObj = [...this.queryString];
    const excludeFields = ["page", "sort", "search", "limit", "fields"];
    excludeFields.forEach((field) => {
      if (queryObj[field]) {
        delete queryObj[field];
      }
    });
    this.query = this.query.find(queryObj);
    return this;
  }
  search(fields = []) {
    const queryStr = this.queryString.search;
    if (queryStr === "" || !fields || fields.length === 0) return this;
    const regex = new RegExp(queryStr, "gi");
    this.query = this.query.find({
      $or: fields.map((field) => ({ [field]: { $regex: regex } })),
    });
    return this;
  }
  sort(sortingString) {
    if (sortingString) {
      //Object.fromEntries => use to convert array to object
      const sortBy = Object.fromEntries(
        sortingString.split(",").map((str) => {
          const [field, order] = str.trim().split(":");
          return [field, order === "desc" ? -1 : 1];
        })
      );

      this.query = this.query.sort(sortBy);
    }
    return this;
  }

  selectFields(fields) {
    if (fields.length === 0) return this;
    this.query = this.query.select(fields);
    return this;
  }
  paginate(limitation = 10) {
    const page = +this.queryString.page || 1;
    const limit = +limitation;
    const startIndex = (page - 1) * limit;
    this.query = this.query.skip(startIndex).limit(limit);
    this.page = page;
    this.limit = limit;
    return this;
  }
  async getPaginations(Model, req) {
    const count = await Model.countDocuments(this.query.getFilter());
    const totalPages = Math.ceil(count / this.limit);
    const data = await this.query;
    const baseUrl = `${req.protocol}://${req.get("host")}${req.baseUrl}${
      req.path
    }`;
    return {
      page: this.page,
      pages: totalPages,
      count: count,
      next: this.page < totalPages ? `${baseUrl}?page=${this.page + 1}` : null,
      previous: this.page > 1 ? `${baseUrl}?page=${this.page - 1}` : null,
      results: data,
    };
  }
}
export default ApiFeature;
