const { DataTypes } = require("sequelize");
const sequelize = require("../database");
const LatestComic = sequelize.define("LatestComic", {
  num: {
    type: DataTypes.INTEGER,
    unique: true,
  },
  last_updated: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
});
module.exports = LatestComic;
