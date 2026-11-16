const AppError = require('./appError');

// Check that every supplied foreign ID points to an existing document.
module.exports = async (references) => {
  const missingReferences = await Promise.all(
    references
      .filter(({ id }) => id !== undefined && id !== null)
      .map(async ({ Model, id, label }) => {
        const exists = await Model.exists({ _id: id });
        return exists ? null : label;
      }),
  );

  const missing = missingReferences.filter(Boolean);
  if (missing.length) {
    throw new AppError(
      `Invalid reference: ${missing.join(', ')} not found`,
      400,
    );
  }
};
