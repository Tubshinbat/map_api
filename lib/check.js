const stringCheck = (value) => {
  return !(
    value === null ||
    value === "" ||
    value === "null" ||
    value === "undefined" ||
    value === undefined
  );
};

exports.valueRequired = (value) => {
  const type = typeof value;

  switch (type) {
    case "boolean":
      return true;
    case "object":
      if (Array.isArray(value)) {
        return value.length > 0;
      }
      return value !== null && Object.keys(value).length > 0;
    default:
      return stringCheck(value);
  }
};
