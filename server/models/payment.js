const { DataTypes } = require('sequelize');
const sequelize = require('../utils/database');

const User = require('./user');
const UserInvestment = require('./userInvestment');

const INTEGER = DataTypes.INTEGER;
const STRING = DataTypes.STRING;
const DATE = DataTypes.DATE;
const BOOLEAN = DataTypes.BOOLEAN;
const DECIMAL = DataTypes.DECIMAL;

const Payments = sequelize.define('payments', {
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
    userInvestmentId: {
        type: INTEGER,
        allowNull: false
    },
    amount: {
        type: DECIMAL,
        allowNull: true
    },
    paymentStatus: {
        type: STRING,
        allowNull: true
    },
    date: {
        type: DATE,
        allowNull: true
    },
    active: {
        type: BOOLEAN,
        defaultValue: true
    }
}, {
    tableName: 'Payment'
});

Payments.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(Payments, { foreignKey: 'userId' });
Payments.belongsTo(UserInvestment, { foreignKey: 'userInvestmentId' });
UserInvestment.hasMany(Payments, { foreignKey: 'userInvestmentId' });

module.exports = Payments;