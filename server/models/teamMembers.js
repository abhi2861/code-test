const { DataTypes } = require('sequelize');
const sequelize = require('../utils/database');

//Datatypes
const INTEGER = DataTypes.INTEGER;
const STRING = DataTypes.STRING;
const BOOLEAN = DataTypes.BOOLEAN;
const TEXT = DataTypes.TEXT;

const TeamMembers = sequelize.define('team', {
    id: {
        type: INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    name: {
        type: STRING
    },
    description: {
        type: TEXT
    },
    profilePhoto: {
        type: STRING
    },
    active: {
        type: BOOLEAN,
        defaultValue: true
    }
}, {
    tableName: 'Team'
});

module.exports = TeamMembers;
