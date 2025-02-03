const { DataTypes } = require('sequelize');
const sequelize = require('../utils/database');

const User = require('./user');

const INTEGER = DataTypes.INTEGER;
const STRING = DataTypes.STRING;
const DATE = DataTypes.DATE;
const BOOLEAN = DataTypes.BOOLEAN;

const UserProfile = sequelize.define('userProfile', {
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
    companyName: {
        type: STRING,
        allowNull: false
    },
    email: {
        type: STRING,
        allowNull: false
    },
    SSN: {
        type: STRING,
        allowNull: false
    },
    yearsOfExperience: {
        type: INTEGER,
        allowNull: true
    },
    termsandConditionsAcceptedDate: {
        type: DATE,
        allowNull: true
    },
    ipAddress: {
        type: STRING,
        allowNull: true
    },
    active: {
        type: BOOLEAN,
        defaultValue: true
    }
},{
    tableName: 'UserProfile'
});

UserProfile.belongsTo(User, { foreignKey: 'userId' });

module.exports = UserProfile