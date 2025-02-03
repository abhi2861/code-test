const { DataTypes } = require('sequelize');
const sequelize = require('../utils/database');

const User = require('./user');
const Company = require('./company');
const InvestmentOpportunity = require('./investmentOpportunity');
const Payment = require('./payment');

const INTEGER = DataTypes.INTEGER;
const STRING = DataTypes.STRING;
const DATE = DataTypes.DATE;
const BOOLEAN = DataTypes.BOOLEAN;

const InvestmentDocument = sequelize.define('investmentDocument', {
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
    investmentOpportunityId: {
        type: INTEGER,
        allowNull: false
    },
    templateId:{
        type: INTEGER,
        allowNull: true
    },
    financialYear: {
        type: INTEGER,
        allowNull: true
    },
    folder: {
        type: STRING,
        allowNull: true
    },
    docLink: {
        type: STRING,
        allowNull: true
    },
    templateName:{
        type: STRING,
        allowNull: true
    },
    templateType:{
        type: STRING,
        allowNull: true
    },
    uploadedBy: {
        type: INTEGER,
        allowNull: true
    },
    uploadedDate: {
        type: DATE,
        allowNull: true
    },
    active:{
        type: BOOLEAN,
        defaultValue: true
    }
},{
    tableName: 'InvestmentDocument'
});


InvestmentDocument.belongsTo(User, { foreignKey: 'userId' });
InvestmentDocument.belongsTo(Company, { foreignKey: 'companyId'});
InvestmentDocument.belongsTo(InvestmentOpportunity, { foreignKey: 'investmentOpportunityId'});
InvestmentDocument.belongsTo(Payment, { foreignKey: 'Id'});

module.exports = InvestmentDocument;