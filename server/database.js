const { Sequelize } = require("sequelize");

// Option 1: Passing a connection URI
const sequelize = new Sequelize("sqlite::memory:"); // Example for sqlite
// const sequelize = new Sequelize("lys_db", "username", "password", {
//   host: "localhost",
//   dialect: "sqlite",
// });

module.exports = sequelize;
