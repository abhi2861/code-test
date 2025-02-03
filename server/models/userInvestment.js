const { DataTypes } = require('sequelize');
const sequelize = require('../utils/database');

const User = require('./user');
const Company = require('./company');
const investmentOpportunity = require('./investmentOpportunity');

const INTEGER = DataTypes.INTEGER;
const STRING = DataTypes.STRING;
const DATE = DataTypes.DATE;
const BOOLEAN = DataTypes.BOOLEAN;
const TEXT = DataTypes.TEXT;
const DECIMAL = DataTypes.DECIMAL;

const UserInvestment = sequelize.define('userInvestment', {
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
    investmentId: {
        type: INTEGER,
        allowNull: false,
    },
    amount: {
        type: DECIMAL,
        allowNull: true
    },
    noOfUnits: {
        type: INTEGER,
        allowNull: true
    },
    status: {
        type: STRING,
        allowNull: true
    },
    requestedDate: {
        type: DATE,
        allowNull: true
    },
    documentId: {
        type: INTEGER,
        allowNull: true
    },
    documentSentDate: {
        type: INTEGER,
        allowNull: true
    },
    documentSignedDate: {
        type: DATE,
        allowNull: true
    },
    documentIdSignedByCompanyDate: {
        type: DATE,
        allowNull: true
    },
    investementDate: {
        type: DATE,
        allowNull: true
    },
    interestedYN: {
        type: BOOLEAN,
        defaultValue: false
    },
    contactedYN: {
        type: BOOLEAN,
        defaultValue: false
    },
    createdBy: {
        type: INTEGER
    },
    updatedBy: {
        type: INTEGER
    },
    requestedJSON: {
        type: TEXT,
    },
    investmentKey: {
        type: STRING(50),
        allowNull: true
    },
    estimatedSharesAtInvestment: {
        type: DECIMAL(20, 2),
        allowNull: true,
    },
    estimatedSharesToday: {
        type: DECIMAL(20, 2),
        allowNull: true,
    },
    netCommitment: {
        type: DECIMAL(20, 2),
        allowNull: true,
    },
    notes: {
        type: STRING(50),
        allowNull: true
    },
    active: {
        type: BOOLEAN,
        defaultValue: true
    },
    carry: {
        type: INTEGER,
        allowNull: true
    }
}, {
    tableName: 'UserInvestment',
    timestamps: true
});

UserInvestment.belongsTo(User, { foreignKey: 'userId' });
UserInvestment.belongsTo(Company, { foreignKey: 'companyId' });
UserInvestment.belongsTo(investmentOpportunity, { foreignKey: 'investmentId' });
investmentOpportunity.hasMany(UserInvestment, { foreignKey: 'investmentId' });
Company.hasMany(UserInvestment, { foreignKey: 'companyId' });
User.hasMany(UserInvestment, { foreignKey: 'userId' });

module.exports = UserInvestment;