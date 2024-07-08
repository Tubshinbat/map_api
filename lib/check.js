const stringCheck = (value) => {
  if (
    value === null ||
    value === "" ||
    value === "null" ||
    value === "undefined" ||
    value === undefined
  ) {
    return false;
  } else {
    return true;
  }
};

exports.valueRequired = (value) => {
  const type = typeof value;

  switch (type) {
    case "boolean":
      return true;
      break;
    case "array":
      if (value.lenght > 0) return true;
      else return false;
      break;
    case "object":
      if (value.toString()) return true;
      return false;
    default:
      return stringCheck(value);
      break;
  }
};
