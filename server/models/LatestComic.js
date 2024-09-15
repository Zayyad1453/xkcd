const { DataTypes } = require("sequelize");
const sequelize = require("../database");
const LatestComic = sequelize.define(
  "LatestComic",
  {
    num: {
      type: DataTypes.INTEGER,
      unique: true,
    },
  },
  {
    freezeTableName: true,
    tableName: "LatestComic",
  }
);
module.exports = LatestComic;
