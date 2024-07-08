const { valueRequired } = require("./check");

exports.sortBuild = (sort, sortDefualt) => {
  let convertSort = sortDefualt;

  if (typeof sort == "string") {
    const spliteSort = sort.split(":");
    if (spliteSort[1] == "ascend") convertSort = { [spliteSort[0]]: 1 };
    if (spliteSort[1] == "descend") convertSort = { [spliteSort[0]]: -1 };
    if (!valueRequired(spliteSort[1])) convertSort = convertSort;
  } else convertSort = sortDefualt;

  return convertSort;
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
