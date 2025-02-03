const { DataTypes } = require('sequelize');
const sequelize = require('../utils/database');

const Company = require('./company');

const STRING = DataTypes.STRING;
const TEXT = DataTypes.TEXT;

const BulletinBoard = sequelize.define('bulletinBoard', {
  companyId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  subject: {
    type: STRING
  },
  message: {
    type: TEXT
  },
  isPublished: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  publishedDate: {
    type: DataTypes.DATE
  },
  source: {
    type: STRING
  },
  createdBy: {
    type: STRING
  },
}, {
  tableName: 'BulletinBoard'
});


Company.hasMany(BulletinBoard, { foreignKey: 'companyId' });

module.exports = BulletinBoard;
