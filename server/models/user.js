const { DataTypes } = require('sequelize');
const sequelize = require('../utils/database');
const UserRole = require('./userRole');
const Role = require('./role');

const INTEGER = DataTypes.INTEGER;
const STRING = DataTypes.STRING;
const TEXT = DataTypes.TEXT;
const DATE = DataTypes.DATE;
const BOOLEAN = DataTypes.BOOLEAN;
const ENUM=DataTypes.ENUM
const User = sequelize.define('User', {
    id: {
        type: INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    socialId: {
        type: STRING,
    },
    socialEmail: {
        type: STRING,
    },
    firstName: {
        type: STRING,
    },
    lastName: {
        type: STRING,
    },
    phone: {
        type: TEXT,
    },
    email: {
        type: STRING,
    },
    password: {
        type: STRING,
        allowNull: true
    },
    socialToken: {
        type: TEXT,
    },
    addressline1: {
        type: STRING,
    },
    city: {
        type: STRING,
    },
    state: {
        type: STRING,
    },
    zipcode: {
        type: INTEGER,
    },
    organisationName: {
        type: STRING,
    },
    occupation: {
        type: STRING,
    },
    roleId: {
        type: INTEGER,
        allowNull: true,
        references: {
            model: 'Role',
            key: 'id'
        },
        foreignKey: true
    },
    country: {
        type: STRING,
    },
    profileType: {
        type: STRING,
    },
    spouseName: {
        type: STRING,
    },
    spouseEmail: {
        type: STRING,
    },
    investmentExperience: {
        type: STRING,
    },
    areaOfExpertise: {
        type: STRING,
    },
    institutionName: {
        type: TEXT,
        allowNull: true
    },
    lastLoginDate: {
        type: DATE
    },
    resetPasswordToken: {
        type: STRING,
        allowNull: true
    },
    resetPasswordExpires: {
        type: DATE,
        allowNull: true
    },
    accreditation: {
        type: STRING
    },
    referredBy: {
        type: STRING
    },
    active: {
        type: BOOLEAN,
        defaultValue: true
    },
    kycApproved:{
        type: BOOLEAN,
        defaultValue: false
    },
    documents:[
        {
            document:{
                fileName:{
                    type:STRING,
                },
                fileLink:{
                    type:STRING,
                }
            },
            documentType:{
                type:STRING,
            },
            documentSide:{
                type: ENUM('Front', "Back")
            },
            d_id: {
                type: STRING
            },
            createdAt:{
                type:DATE
            }
        }
    ],

}, {
    tableName: 'User',
    indexes: [
        {
            unique: true,
            fields: ['email']
        }
    ]
});

User.belongsTo(UserRole, { foreignKey: 'userRoleId' });
User.belongsTo(Role, { as: 'role', foreignKey: 'roleId' });

module.exports = User