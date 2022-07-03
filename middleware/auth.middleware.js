const { json } = require("body-parser");
const httpContext = require("express-http-context");

const jwt = require("jsonwebtoken");
const logger = require("../services/logger")(module);

const config = require("../config/config");

module.exports = async (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    if (!token) {
      logger.error("token not provided");
      return res.status(401).json({ error: "Token invalid" }).end();
    }

    const decoded = jwt.verify(token, config.app);
    req.userId = decoded.userId;
    req.email = decoded.email;
    httpContext.set("userId", decoded?.userId);
    httpContext.set("email", decoded?.email);
    return next();
  } catch (error) {
    logger.error("Not authorized");
    return res.status(401).json({ message: "Not authorized" }).end();
  }
};
