const User = require("../models/user");

exports.findOne = async (value) => {
  return await User.findOne({ where: { email: value } });
};

exports.findById = async (id) => {
  // console.log("here ", id);
  return await User.findByPk(id);
};
