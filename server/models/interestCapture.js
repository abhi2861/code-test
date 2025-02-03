const { DataTypes } = require('sequelize');
const sequelize = require('../utils/database');

const User = require('./user');
const InterestSurvey = require('./interestSurvey');
const Company = require('./company');

const INTEGER = DataTypes.INTEGER;
const BOOLEAN = DataTypes.BOOLEAN;
const DATE = DataTypes.DATE;
const DECIMAL = DataTypes.DECIMAL;

const InterestCapture = sequelize.define('interestCapture', {
    id: {
        type: INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    interestSurveyId: {
        type: INTEGER,
        allowNull: false
    },
    userId: {
        type: INTEGER,
        allowNull: false
    },
    companyId: {
        type: INTEGER,
        allowNull: false
    },
    interestedYN: {
        type: BOOLEAN,
        defaultValue: false
    },
    committedYN: {
        type: BOOLEAN,
        defaultValue: false
    },
    contactedYN: {
        type: BOOLEAN,
        defaultValue: false
    },
    amount: {
        type: DECIMAL,
        allowNull: true
    },
    minimumInvestmentAmount: {
        type: DECIMAL,
        allowNull: true
    },
    initialInterestShownDate: {
        type: DATE,
    },
    createdBy: {
        type: INTEGER,
        allowNull: false
    },
    active: {
        type: BOOLEAN,
        defaultValue: true
    }
}, {
    tableName: 'InterestCapture'
});

InterestCapture.belongsTo(InterestSurvey, { foreignKey: 'interestSurveyId' });
InterestSurvey.hasMany(InterestCapture, { foreignKey: 'interestSurveyId' })
InterestCapture.belongsTo(User, { foreignKey: 'userId' });
InterestCapture.belongsTo(Company, { foreignKey: 'companyId' });
Company.hasMany(InterestCapture, { foreignKey: 'companyId' });
User.hasMany(InterestCapture, { foreignKey: 'userId' })

module.exports = InterestCapture