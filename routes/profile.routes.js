const { Router } = require("express"),
  { body, query, check, param } = require("express-validator");

const User = require("../models/user"),
  authMiddleware = require("../middleware/auth.middleware"),
  profileController = require("../controllers/profile.controller");

const router = Router();

router.get("/", authMiddleware, profileController.getProfiles);

router.get(
  "/:id",
  param("id").isInt().withMessage("the id need to be of type integer"),
  authMiddleware,
  profileController.getProfile
);

router.put(
  "/:id",
  param("id").isInt().withMessage("the id need to be of type integer"),
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
  body("gender")
    .trim()
    .notEmpty()
    .withMessage("the gender can't be empty")
    .isLength({ min: 3 })
    .withMessage("gender too short"),
  authMiddleware,
  profileController.editProfile
);

module.exports = router;
