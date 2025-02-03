const { DataTypes } = require('sequelize');
const sequelize = require('../utils/database');

const ErrorLog = sequelize.define('errorLog', {
  statusCode: {
    type: DataTypes.INTEGER
  },
  message: {
    type: DataTypes.JSON
  },
  route: {
    type: DataTypes.STRING
  },
  method: {
    type: DataTypes.STRING
  },
  requestBody: {
    type: DataTypes.JSON
  },
  error: {
    type: DataTypes.JSON
  },
}, {
  tableName: 'ErrorLog',
  timestamps: true
});

module.exports = ErrorLog;
