const { DataTypes } = require('sequelize');
const sequelize = require('../utils/database');

const Company = require('./company');
const User = require('./user');

const INTEGER = DataTypes.INTEGER;
const DATE = DataTypes.DATE;
const BOOLEAN = DataTypes.BOOLEAN;
const STRING = DataTypes.STRING;
const TEXT = DataTypes.TEXT;

const InterestSurvey = sequelize.define('interestSurvey', {
    id: {
        type: INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    companyId: {
        type: INTEGER,
        allowNull: false
    },
    name: {
        type: STRING,
        allowNull: true
    },
    description: {
        type: TEXT,
        allowNull: true
    },
    document: {
        type: STRING,
        allowNull: true
    },
    notes: {
        type: STRING,
        allowNull: true
    },
    startDate: {
        type: DATE,
        allowNull: true
    },
    endDate: {
        type: DATE,
        allowNull: false
    },
    investmentRange: {
        type: STRING,
        allowNull: true
    },
    createdBy: {
        type: INTEGER,
        allowNull: false
    },
    updatedBy: {
        type: INTEGER,
        allowNull: true
    },
    active: {
        type: BOOLEAN,
        defaultValue: true
    }
}, {
    tableName: 'InterestSurvey'
});

InterestSurvey.belongsTo(User, { foreignKey: 'createdBy' });
Company.hasMany(InterestSurvey, { foreignKey: 'companyId' });
InterestSurvey.belongsTo(Company, { foreignKey: 'companyId' });

module.exports = InterestSurvey