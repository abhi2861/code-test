const { DataTypes } = require('sequelize');
const sequelize = require('../utils/database');
const UserInvestment = require('./userInvestment');

const INTEGER = DataTypes.INTEGER;
const STRING = DataTypes.STRING;
const BOOLEAN = DataTypes.BOOLEAN;
const DATE = DataTypes.DATE;

const StatusHistory = sequelize.define('StatusHistory', {
    id: {
        type: INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    userInvestmentId: {
        type: INTEGER,
        allowNull: false
    },
    status: {
        type: STRING,
        allowNull: false
    },
    date: {
        type: DATE,
        allowNull: false
    },
    active: {
        type: BOOLEAN,
        defaultValue: true
    }
}, {
    tableName: 'StatusHistory'
});

StatusHistory.belongsTo(UserInvestment, { foreignKey: 'userInvestmentId' });
UserInvestment.hasMany(StatusHistory, { foreignKey: 'userInvestmentId' });

module.exports = StatusHistory