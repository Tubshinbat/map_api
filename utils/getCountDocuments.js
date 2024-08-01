const getCountDocuments = async (Model) => {
  const count = await Model.countDocuments();
  return count;
};

module.exports = getCountDocuments;
