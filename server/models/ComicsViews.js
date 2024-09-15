const { DataTypes } = require("sequelize");
const sequelize = require("../database");
const ComicsViews = sequelize.define(
  "ComicsViews",
  {
    num: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    view_count: DataTypes.INTEGER,
  },
  {
    freezeTableName: true,
    tableName: "ComicsViews",
  }
);

module.exports = ComicsViews;
