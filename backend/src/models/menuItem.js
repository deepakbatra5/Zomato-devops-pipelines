const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Restaurant = require('./restaurant');

const MenuItem = sequelize.define('MenuItem', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: DataTypes.STRING,
  price: DataTypes.INTEGER,
  description: DataTypes.TEXT,
  image: DataTypes.STRING,
  category: DataTypes.STRING,
  isVeg: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  isBestseller: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
});

MenuItem.belongsTo(Restaurant);
Restaurant.hasMany(MenuItem);

module.exports = MenuItem;