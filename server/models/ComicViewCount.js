const { DataTypes } = require("sequelize");
const sequelize = require("../database");

const ComicViewCount = sequelize.define("ComicViewCount", {
  num: {
    type: DataTypes.INTEGER,
    primaryKey: true,
  },
  view_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
});

module.exports = ComicViewCount;
