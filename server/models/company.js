const { DataTypes } = require('sequelize');
const sequelize = require('../utils/database');

//Models
const User = require('./user');

//Datatypes
const INTEGER = DataTypes.INTEGER;
const STRING = DataTypes.STRING;
const BOOLEAN = DataTypes.BOOLEAN;
const TEXT = DataTypes.TEXT;
const DATE = DataTypes.DATE;
const DECIMAL = DataTypes.DECIMAL;

const Company = sequelize.define('company', {
    id: {
        type: INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    name: {
        type: STRING
    },
    description: {
        type: TEXT
    },
    logo: {
        type: STRING
    },
    companyProfile: {
        type: STRING,
        allowNull: true,
    },
    createdBy: {
        type: INTEGER,
        allowNull: false,
    },
    fmvValue: {
        type: DECIMAL,
        allowNull: true
    },
    fmvVEffectiveDate: {
        type: DATE,
        allowNull: true
    },
    fmvVExpirationDate: {
        type: DATE,
        allowNull: true
    },
    fmvlastFairMarketValue: {
        type: DECIMAL,
        allowNull: true
    },
    active: {
        type: BOOLEAN,
        defaultValue: true
    }
}, {
    tableName: 'Company'
});

Company.belongsTo(User, { foreignKey: 'createdBy' });

module.exports = Company;
