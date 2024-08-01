const { valueRequired } = require("./check");

exports.sortBuild = (sort, sortDefault) => {
  if (typeof sort !== "string") {
    return sortDefault;
  }

  const [field, order] = sort.split(":");

  if (order === "ascend") {
    return { [field]: 1 };
  }

  if (order === "descend") {
    return { [field]: -1 };
  }

  if (!valueRequired(order)) {
    return sortDefault;
  }

  return sortDefault;
};

exports.getModelPaths = (model) => {
  const modelPaths = Object.keys(model.schema.obj);
  const deleteFields = [
    "createUser",
    "updateUser",
    "createAt",
    "updateAt",
    "picture",
    "cover",
    "icon",
    "pictures",
    "program",
    "password",
    "status",
    "categories",
    "all",
    "views",
    "star",
    "role",
    "newsActive",
    "listActive",
    "pageParentActive",
    "modelActive",
    "pageActive",
    "isDirect",
    "type",
    "password",
  ];
  return modelPaths.filter((path) => !deleteFields.includes(path));
};
