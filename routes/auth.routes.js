const { Router } = require("express");
const { body, query, check } = require("express-validator");

const User = require("../models/user");
const authController = require("../controllers/auth.controller");

const router = Router();

router.post(
  "/login",
  body("email")
    .trim()
    .exists()
    .normalizeEmail()
    .isEmail()
    .withMessage("Please provide a correct email format"),
  body("password")
    .trim()
    .isLength({ min: 8 })
    .withMessage("Password too short"),
  authController.login
);

//signup route with verification for the input
router.post(
  "/register",
  body("firstname")
    .trim()
    .isString()
    .exists({ checkNull: true })
    .withMessage("The firstname can't be empty")
    .isLength({ min: 5, max: 50 })
    .withMessage("Please the provide firstname"),
  body("lastname")
    .trim()
    .isString()
    .exists({ checkNull: true })
    .withMessage("The lastname can't be empty")
    .isLength({ min: 5, max: 50 })
    .withMessage("Please the provide lastname"),
  check("email")
    .trim()
    .normalizeEmail()
    .isEmail()
    .withMessage("Please provide a correct email format"),
  body("password")
    .trim()
    .exists()
    .withMessage("the password can't be empty")
    .isLength({ min: 8 })
    .withMessage("Password too short"),
  authController.register
);

module.exports = router;
