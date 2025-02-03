const { DataTypes, BOOLEAN } = require('sequelize');
const sequelize = require('../utils/database');

const STRING = DataTypes.STRING;

const partnersModel = sequelize.define('partners', {
    partnerId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    companyName: {
        type: STRING
    },
    logo: {
        type: STRING
    },
    favIcon: {
        type: STRING
    },
    email: {
        type: STRING
    },
    companyEmail: {
        type: STRING
    },
    address: {
        type: STRING
    },
    password: {
        type: STRING
    },
    active: {
        type: BOOLEAN
    },
    phoneNumber:{
        type: STRING
    },
    createdBy: {
        type: STRING
    },
}, {
    tableName: 'Partners'
});


module.exports = partnersModel;
