const { DataTypes } = require('sequelize');
const sequelize = require('../utils/database');
const User = require('./user');

const INTEGER = DataTypes.INTEGER;
const STRING = DataTypes.STRING;
const DATE = DataTypes.DATE;
const BOOLEAN = DataTypes.BOOLEAN;
const ENUM = DataTypes.ENUM;

const Notification = sequelize.define('Notification', {
    id: {
        type: INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    userId: {
        type: INTEGER,
        allowNull: false,
    },
    type: {
        type: ENUM('OTP'),
        allowNull: false
    }, // otp fields
    otp: {
        type: STRING,
        allowNull: true
    },
    email: {
        type: STRING,
        allowNull: false
    },
    expirationTime: {
        type: DATE,
        allowNull: true
    },
    verified: {
        type: BOOLEAN,
        allowNull: true,
        defaultValue: false
    },
    sentAt: {
        type: DATE,
        defaultValue: DataTypes.NOW,
        allowNull: false
    },
}, {
    tableName: 'Notification'
});

Notification.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(Notification, { foreignKey: 'userId' });
module.exports = Notification;
