const cron = require("node-cron");
const cors = require("cors");
const compression = require("compression");
const helmet = require("helmet");
const express = require("express");
const fs = require("fs");
const httpContext = require("express-http-context");
const multer = require("multer");
const flash = require("connect-flash");

const authRouter = require("./routes/auth.routes");
const profilRouter = require("./routes/profile.routes");
const logger = require("./services/logger")(module);
const sequelize = require("./config/db/dbConfig");
const config = require("./config/config");
const path = require("path");

const app = express();

//headers protection
app.use(helmet());

//Performance
app.use(compression());

app.use(cors());

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "./uploads"));
  },
  filename: (req, file, cb) => {
    cb(
      null,
      new Date().toISOString().replace(/:/g, "-") + "-" + file.originalname
    );
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === "image/png" || file.mimetype === "image/jpg") {
    cb(null, true);
  } else {
    return cb("Please select just file with extension .jpg or .png");
  }
};

app.use(httpContext.middleware);
app.use((req, res, next) => {
  httpContext.ns.bindEmitter(req);
  httpContext.ns.bindEmitter(res);
  httpContext.set("method", req?.method);
  httpContext.set("url", req?.url);
  next();
});

app.use(express.json());
app.use(
  multer({
    storage: fileStorage,
    fileFilter,
    limits: { fieldSize: 1024 * 1024 * 10 },
  }).single("image")
);
app.use(express.static(`${__dirname}/public`));

app.use(flash());
// app.use(csurf());

//routes
app.use("/user", authRouter);
app.use("/profile", profilRouter);

cron.schedule("0 * * * *", () => {
  fs.rm("./public/images/", { recursive: true, force: true }, (err) => {
    if (err) logger(err);
  });
});

//Error handling
app.use((error, req, res, next) => {
  logger.info(error);
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;
  res.status(status).json({ message: message, data: data });
});

//server
async function start() {
  try {
    await sequelize.authenticate().then(() => {
      app.listen(config.port, () => {
        logger.info(
          `Connection has been established to the database and app started in port ${config.port}`
        );
      });
    });
  } catch (error) {
    logger.error("Unable to connect to the database ", error);
    sequelize.close();
    process.exit(1);
  }
}

start();

module.exports = app;
