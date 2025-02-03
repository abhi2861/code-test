const { DataTypes } = require('sequelize');
const sequelize = require('../utils/database');
const User = require('./user');

const INTEGER = DataTypes.INTEGER;
const STRING = DataTypes.STRING;
const DATE = DataTypes.DATE;
const BOOLEAN = DataTypes.BOOLEAN

const Email = sequelize.define('Email', {
  id: {
    type: INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  userId: {
    type: INTEGER,
    allowNull: false,
  },
  sentById: {
    type: INTEGER,
    allowNull: false
  },
  emailFrom: {
    type: STRING,
    allowNull: false
  },
  emailTo: {
    type: STRING,
    allowNull: false
  },
  subject: {
    type: STRING,
    allowNull: true
  },
  body: {
    type: STRING,
    allowNull: true
  },
  sentAt: {
    type: DATE,
    defaultValue: DataTypes.NOW,
    allowNull: false
  },
  isSent: {
    type: BOOLEAN,
    defaultValue: false,
    allowNull: false
  },
}, {
  tableName: 'Email'
});

Email.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(Email,{foreignKey: 'userId'});

module.exports = Email;
