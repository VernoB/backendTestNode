const { validationResult } = require("express-validator");
const config = require("../config/config");
const User = require("../models/user");
const logger = require("../services/logger")(module);
const { findById } = require("../services/auth.service");

exports.editProfile = async (req, res, next) => {
  logger.info(`edit user profile ...`);

  const errorFormater = ({ msg, param }) => {
    return `${param}: ${msg}`;
  };
  const result = validationResult(req).formatWith(errorFormater);

  if (!result.isEmpty()) {
    logger.error("Error in the validation fields");
    return res.status(400).json({ error: result.array() }).end();
  }

  const { firstname, lastname, gender, email } = req.body;
  const { id } = req.params;

  return await findById(id)
    .then((user) => {
      if (!user) {
        logger.info("id not exist in the database");
        res.status(400).json({ error: "id not found!" });
      }

      return user;
    })
    .then((_user) => {
      return User.update(
        {
          firstname,
          lastname,
          gender,
          email,
        },
        { where: { id } }
      );
    })
    .then((result) => {
      logger.info(`User updated with id ${id}`);
      res
        .status(200)
        .json({ message: "User successfully update", data: result });
    })
    .catch((err) => {
      logger.error(err);
      res.status(500).json({ error: "error in the updated process" });
    });
};

exports.getProfile = async (req, res, next) => {
  const { id } = req.params;

  if (!id) {
    logger.error("id not provided");
    res.status(400).json({ error: "your need to provided valid id" });
  }

  return await findById(id)
    .then((user) => {
      if (!user) {
        logger.error("id not exist in the database");
        res.status(400).json({ error: "user not found!" });
      }

      logger.info(`User fetched successfully`);
      res
        .status(200)
        .json({ message: "User successfully fetched", data: user });
    })
    .catch((err) => {
      logger.error(err);
      res.status(500).json({ error: "Error while fetching user" });
    });
};

exports.getProfiles = async (req, res, next) => {
  const page = req.query.page ? req.query.page - 1 : 1;
  const limit = 10;
  const offset = page * limit;

  return await User.findAndCountAll({
    where: {},
    offset,
    limit,
    $sort: { registrationDate: 1 },
  })
    .then((result) => {
      const { count, rows } = result;
      logger.info(`data fetched successfully with paginated option`);
      res.status(200).json({
        message: "data fetched successfully",
        data: rows,
        totalItems: count,
      });
    })
    .catch((err) => {
      logger.error(`Error : ${err}`);
      res.status(500).json({ error: "Error while fetching user" });
    });
};
