const AppError = require('./appError');

class APIFeatures {
  constructor(query, queryString, options = {}) {
    this.query = query;
    this.queryString = queryString;
    this.defaultSort = options.defaultSort || '-createdAt';
    this.defaultFields = options.defaultFields || '-__v';
    this.defaultLimit = options.defaultLimit || 100;
    this.maxLimit = options.maxLimit || 100;
    this.filterQuery = {};
    this.skip = 0;
  }

  filter() {
    const queryObj = { ...this.queryString };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((field) => delete queryObj[field]);

    // Convert operators like gte[3] into MongoDB operators such as $gte.
    let queryString = JSON.stringify(queryObj);
    queryString = queryString.replace(
      /\b(gte|gt|lte|lt)\b/g,
      (operator) => `$${operator}`,
    );

    this.filterQuery = JSON.parse(queryString);
    this.query = this.query.find(this.filterQuery);
    return this;
  }

  sort(defaultSort = this.defaultSort) {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else if (defaultSort) {
      this.query = this.query.sort(defaultSort);
    }

    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else if (this.defaultFields) {
      this.query = this.query.select(this.defaultFields);
    }

    return this;
  }

  paginate() {
    const page = this.readPositiveInteger(this.queryString.page, 'page', 1);
    const limit = this.readPositiveInteger(
      this.queryString.limit,
      'limit',
      this.defaultLimit,
    );

    if (limit > this.maxLimit) {
      throw new AppError(`Limit cannot exceed ${this.maxLimit}`, 400);
    }

    this.skip = (page - 1) * limit;
    this.query = this.query.skip(this.skip).limit(limit);
    return this;
  }

  readPositiveInteger(value, fieldName, fallback) {
    if (value === undefined) return fallback;

    const parsedValue = Number(value);
    if (!Number.isSafeInteger(parsedValue) || parsedValue < 1) {
      throw new AppError(`${fieldName} must be a positive integer`, 400);
    }

    return parsedValue;
  }
}

module.exports = APIFeatures;
