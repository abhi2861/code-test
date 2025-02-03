const { DataTypes } = require('sequelize');
const sequelize = require('../utils/database');

const User = require('./user');
const Company = require('./company');
const Template = require('./template');

const INTEGER = DataTypes.INTEGER;
const DATE = DataTypes.DATE;
const BOOLEAN = DataTypes.BOOLEAN;
const STRING = DataTypes.STRING;
const TEXT = DataTypes.TEXT;
const DECIMAL = DataTypes.DECIMAL;
const JSON = DataTypes.JSON;

const InvestmentOpportunity = sequelize.define('InvestmentOpportunity', {
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
    userId: {
        type: INTEGER,
        allowNull: false
    },
    templateId: {
        type: INTEGER,
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
    minAmount: {
        type: DECIMAL,
        allowNull: true
    },
    perUnitPrice: {
        type: INTEGER,
        allowNull: true
    },
    carry: {
        type: INTEGER,
        allowNull: true
    },
    startDate: {
        type: DATE,
        allowNull: true
    },
    endDate: {
        type: DATE,
        allowNull: true
    },
    investmentStatus: {
        type: STRING,
        allowNull: true
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
    estimatedCloseDate: {
        type: DATE,
        allowNull: true
    },
    investmentType: {
        type: STRING,
        allowNull: true
    },
    otherDoc: {
        type: STRING,
        allowNull: true
    },
    managementFee: {
        type: DECIMAL,
        allowNull: true
    },
    expenseReserve: {
        type: DECIMAL,
        allowNull: true
    },
    carryPercentage:{
        type:JSON,
    },
    active: {
        type: BOOLEAN,
        defaultValue: true
    }
}, {
    tableName: 'InvestmentOpportunity'
});

InvestmentOpportunity.belongsTo(User, { foreignKey: 'userId' });
Company.hasMany(InvestmentOpportunity, { foreignKey: 'companyId' });
InvestmentOpportunity.belongsTo(Company, { foreignKey: 'companyId' });
InvestmentOpportunity.belongsTo(Template, { foreignKey: 'templateId' });

module.exports = InvestmentOpportunity;