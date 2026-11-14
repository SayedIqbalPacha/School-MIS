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
