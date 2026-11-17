const mongoose = require('mongoose');
const AppError = require('./appError');

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

class APIFeatures {
  constructor(query, queryString, options = {}) {
    this.query = query;
    this.model = query.model;
    this.queryString = queryString;
    this.defaultSort = options.defaultSort || '-createdAt';
    this.defaultFields = options.defaultFields || '-__v';
    this.defaultLimit =
      options.defaultLimit === undefined ? 10 : options.defaultLimit;
    this.maxLimit = Math.min(
      options.maxLimit === undefined ? 100 : options.maxLimit,
      100,
    );
    this.searchFields = options.searchFields || [];
    this.baseFilter = options.baseFilter || {};
    this.filterQuery = this.baseFilter;
    this.page = 1;
    this.limit = this.defaultLimit;
    this.skip = 0;
  }

  filter() {
    const queryObj = { ...this.queryString };
    const excludedFields = ['page', 'sort', 'limit', 'fields', 'search'];
    excludedFields.forEach((field) => delete queryObj[field]);

    // Convert operators like gte[3] into MongoDB operators such as $gte.
    let queryString = JSON.stringify(queryObj);
    queryString = queryString.replace(
      /\b(gte|gt|lte|lt)\b/g,
      (operator) => `$${operator}`,
    );

    const requestFilter = JSON.parse(queryString);
    if (
      Object.keys(this.baseFilter).length &&
      Object.keys(requestFilter).length
    ) {
      this.filterQuery = { $and: [this.baseFilter, requestFilter] };
    } else {
      this.filterQuery = Object.keys(this.baseFilter).length
        ? this.baseFilter
        : requestFilter;
    }
    this.query = this.query.find(this.filterQuery);
    return this;
  }

  search(fields = this.searchFields) {
    if (this.queryString.search === undefined) return this;

    const searchTerm = this.queryString.search;
    if (typeof searchTerm !== 'string' || searchTerm.length > 100) {
      throw new AppError(
        'search must be a string of 100 characters or less',
        400,
      );
    }

    const normalizedTerm = searchTerm.trim();
    if (!normalizedTerm) return this;
    if (!fields.length) {
      throw new AppError('Search is not supported for this collection', 400);
    }

    const clauses = fields.reduce((searchClauses, field) => {
      const schemaType = this.model.schema.path(field);
      if (!schemaType) return searchClauses;

      if (schemaType.instance === 'String') {
        searchClauses.push({
          [field]: { $regex: escapeRegex(normalizedTerm), $options: 'i' },
        });
      } else if (schemaType.instance === 'ObjectId') {
        if (/^[\da-f]{24}$/i.test(normalizedTerm)) {
          searchClauses.push({
            [field]: new mongoose.Types.ObjectId(normalizedTerm),
          });
        }
      } else if (schemaType.instance === 'Number') {
        const numericTerm = Number(normalizedTerm);
        if (Number.isFinite(numericTerm)) {
          searchClauses.push({ [field]: numericTerm });
        }
      }

      return searchClauses;
    }, []);

    const searchQuery = clauses.length
      ? { $or: clauses }
      : { _id: { $exists: false } };
    this.filterQuery = Object.keys(this.filterQuery).length
      ? { $and: [this.filterQuery, searchQuery] }
      : searchQuery;
    this.query = this.query.find(searchQuery);
    return this;
  }

  sort(defaultSort = this.defaultSort) {
    if (
      this.queryString.sort !== undefined &&
      typeof this.queryString.sort !== 'string'
    ) {
      throw new AppError('sort must be a comma-separated string', 400);
    }

    const sortValue = this.queryString.sort
      ? this.queryString.sort.split(',').join(' ').trim()
      : '';
    const requestedSort = sortValue || defaultSort;
    const sortFields = requestedSort
      ? requestedSort.split(/\s+/).filter(Boolean)
      : [];

    if (
      sortFields.length &&
      !sortFields.some((field) => field.replace(/^-/, '') === '_id')
    ) {
      sortFields.push('_id');
    }

    if (sortFields.length) this.query = this.query.sort(sortFields.join(' '));
    return this;
  }

  limitFields() {
    if (
      this.queryString.fields !== undefined &&
      typeof this.queryString.fields !== 'string'
    ) {
      throw new AppError('fields must be a comma-separated string', 400);
    }

    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else if (this.defaultFields) {
      this.query = this.query.select(this.defaultFields);
    }

    return this;
  }

  paginate() {
    this.page = this.readPositiveInteger(this.queryString.page, 'page', 1);
    this.limit = this.readPositiveInteger(
      this.queryString.limit,
      'limit',
      this.defaultLimit,
    );

    if (this.limit > this.maxLimit) {
      throw new AppError(`Limit cannot exceed ${this.maxLimit}`, 400);
    }

    this.skip = (this.page - 1) * this.limit;
    if (!Number.isSafeInteger(this.skip)) {
      throw new AppError('page is too large', 400);
    }

    this.query = this.query.skip(this.skip).limit(this.limit);
    return this;
  }

  readPositiveInteger(value, fieldName, fallback) {
    if (value === undefined) return fallback;

    if (typeof value !== 'string' || !/^\d+$/.test(value)) {
      throw new AppError(`${fieldName} must be a positive integer`, 400);
    }

    const parsedValue = Number(value);
    if (!Number.isSafeInteger(parsedValue) || parsedValue < 1) {
      throw new AppError(`${fieldName} must be a positive integer`, 400);
    }

    return parsedValue;
  }

  async execute() {
    const [documents, totalRecords] = await Promise.all([
      this.query,
      this.model.countDocuments(this.filterQuery),
    ]);

    if (totalRecords > 0 && this.skip >= totalRecords) {
      throw new AppError('This page does not exist', 404);
    }

    const totalPages = Math.ceil(totalRecords / this.limit);
    return {
      documents,
      totalRecords,
      pagination: {
        totalRecords,
        totalPages,
        currentPage: this.page,
        limit: this.limit,
        hasNextPage: this.page < totalPages,
        hasPrevPage: this.page > 1,
      },
    };
  }
}

module.exports = APIFeatures;
