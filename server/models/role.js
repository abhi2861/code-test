const { DataTypes } = require('sequelize');
const sequelize = require('../utils/database');

const INTEGER = DataTypes.INTEGER;
const STRING = DataTypes.STRING;
const BOOLEAN = DataTypes.BOOLEAN;

const Role = sequelize.define('Role', {
    id: {
        type: INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    name: {
        type: STRING,
        allowNull: false,
    },
    description: {
        type: STRING,
    },
    enable: {
        type: BOOLEAN,
        allowNull: false,
    }
},{
    tableName: 'Role'
});

module.exports = Role;