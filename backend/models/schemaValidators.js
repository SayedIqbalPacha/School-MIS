const mongoose = require('mongoose');
const AppError = require('../utils/appError');

exports.isInteger = Number.isInteger;

exports.isNonFutureDate = function (value) {
  return !value || value <= new Date();
};

exports.dateIsOnOrAfter = (startField) =>
  function (value) {
    return !value || !this[startField] || value >= this[startField];
  };

exports.isNonNegativeDecimal = function (value) {
  return (
    value == null ||
    (Number.isFinite(Number(value.toString())) && Number(value.toString()) >= 0)
  );
};

exports.preventDeletionWhenReferenced = (dependentReferences, recordName) =>
  async function () {
    const { includeInactive } = this.getOptions();

    const recordQuery = this.model.findOne(this.getQuery());
    if (includeInactive) recordQuery.setOptions({ includeInactive: true });
    const record = await recordQuery;
    if (!record) return;

    const references = await Promise.all(
      dependentReferences.map(async ({ modelName, field, label }) => {
        const exists = await mongoose
          .model(modelName)
          .exists({ [field]: record._id });
        return exists ? label : null;
      }),
    );
    const existingReferences = references.filter(Boolean);

    if (existingReferences.length) {
      throw new AppError(
        `Cannot delete this ${recordName} because it is referenced by ${existingReferences.join(', ')}`,
        409,
      );
    }
  };

exports.validateDateOrderOnUpdate = (startField, endField, message) =>
  async function () {
    const currentRecord = await this.model.findOne(this.getQuery());
    if (!currentRecord) return;

    const update = this.getUpdate() || {};
    const updatedFields = update.$set || update;
    const startDate =
      updatedFields[startField] !== undefined
        ? updatedFields[startField]
        : currentRecord[startField];
    const endDate =
      updatedFields[endField] !== undefined
        ? updatedFields[endField]
        : currentRecord[endField];

    if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
      const validationError = new mongoose.Error.ValidationError();
      validationError.addError(
        endField,
        new mongoose.Error.ValidatorError({ path: endField, message }),
      );
      throw validationError;
    }
  };
