const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
module.exports = sequelize.define('Restaurant',{
  id:{type:DataTypes.INTEGER,primaryKey:true,autoIncrement:true},
  name:{type:DataTypes.STRING,allowNull:false},
  cuisine:DataTypes.STRING,
  rating:{type:DataTypes.FLOAT,defaultValue:0},
  location:DataTypes.STRING,
  image:DataTypes.STRING,
  deliveryTime:DataTypes.STRING
});