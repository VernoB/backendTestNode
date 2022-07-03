const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");

const config = require("../config/config.json");
const logger = require("../services/logger")(module);
const User = require("../models/user");
const { findOne } = require("../services/auth.service");
const {
  generateSalt,
  validatePassword,
} = require("../services/validate-password.services");

exports.register = async (req, res, next) => {
  logger.info(`Creating new user ...`);

  const errorFormater = ({ msg, param }) => {
    return `${param}: ${msg}`;
  };
  const result = validationResult(req).formatWith(errorFormater);

  if (!result.isEmpty()) {
    logger.error("Error in the validation fields");
    res.status(400).json({ error: result.array() }).end();
    return;
  }

  const { firstname, lastname, email, password } = req.body;
  const image = req.file;

  if (!image) {
    logger.error("Image not provide");
    res.status(422).json({ error: "image not provide" });
    return;
  }

  if (!firstname) {
    logger.info("The firstname is empty");
    res.status(422).json({ message: "The firstname is empty" }).end();
  }

  if (!lastname) {
    logger.info("The firstname is empty");
    res.status(422).json({ message: "The lastname is empty" }).end();
  }

  if (!email) {
    logger.info("The firstname is empty");
    res.status(422).json({ message: "The email is empty" }).end();
  }

  if (!password) {
    logger.info("The password is empty");
    res.status(422).json({ message: "The password is empty" }).end();
  }

  //create a salt for password
  const saltedPw = await generateSalt();

  const { path } = image;

  return await bcrypt
    .hash(password, saltedPw)
    .then((hashedPw) => {
      return User.create({
        firstname,
        lastname,
        photo: path,
        password: hashedPw,
        email,
        salt: saltedPw,
      });
    })
    .then((result) => {
      logger.info(`New user Created with id ${result.id}`);
      res
        .status(201)
        .json({ message: "User created successfully!", data: result })
        .end();
    })
    .catch((err) => {
      // console.log(err.parent.errno);
      if (err.parent.errno === 1062) {
        logger.error(`The email provide already exits in the database`);
        res.status(400).json({ error: "Email exist in the database" });
        return;
      } else {
        logger.error(err);
        res.status(500).json({ error: "Error in user creation" });
        return;
      }
    });
};

exports.login = async (req, res, next) => {
  //we supposed we can connect with email
  const { email, password } = req.body;

  if (!email) {
    logger.info("Email empty");
    return res
      .status(422)
      .json({ error: "You need to provided the email address" });
  }

  const errorFormater = ({ msg, param }) => {
    return `${param}: ${msg}`;
  };
  const result = validationResult(req).formatWith(errorFormater);

  if (!result.isEmpty()) {
    logger.error("Error in the validation fields");
    return res.status(400).json({ error: result.array() }).end();
  }

  return findOne(email)
    .then((user) => {
      if (!user) {
        logger.info("email not found in the database");
        return res.status(404).json({ error: "User not found!" });
      }

      return user;
      // res.status(201).json({ data: user });
    })
    .then((result) => {
      const { id, salt, email } = result;
      if (!validatePassword(password, result?.password, salt)) {
        logger.info("Error in the provide password");
        return res.status(400).json({ error: "email / password not match" });
      }
      const token = jwt.sign(
        {
          userId: id.toString(),
          email,
        },
        config.app,
        { expiresIn: config.jwt_ttl }
      );
      logger.info(`Token successfully generated with id ${id}`);
      return res.status(200).json({ token, userId: id.toString() });
    })
    .catch((err) => {
      logger.error("error in the login process ", err);
      res.status(500).json({ error: err });
    });
};
