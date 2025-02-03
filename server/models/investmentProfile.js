const { DataTypes} = require('sequelize');
const sequelize = require('../utils/database');

const User = require('./user');

const INTEGER = DataTypes.INTEGER;
const STRING = DataTypes.STRING;
const BOOLEAN = DataTypes.BOOLEAN;

const InvestmentProfile = sequelize.define('investmentProfile', {
    id: {
        type: INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    userId: {
        type: INTEGER,
        allowNull: false
    },
    profileType: {
        type: STRING,
        allowNull: true
    },
    profileName: {
        type: STRING,
        allowNull: true
    },
    otherInvestors: {
        type: STRING,
        allowNull: true
    },
    active: {
        type: BOOLEAN,
        defaultValue: true
    }
},{
    tableName: 'InvestmentProfile'
});

InvestmentProfile.belongsTo(User, { foreignKey: 'userId', constraints: false });
module.exports = InvestmentProfile