const { Sequelize } = require("sequelize");

module.exports = new Sequelize({
  host: "localhost",
  dialect: "mysql",
  username: "test",
  password: "admin",
  database: "apibackend",
  port: 3306,
  sync: true,
  logging: (msg) => console.log(msg),
});
