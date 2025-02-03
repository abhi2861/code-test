const { DataTypes } = require('sequelize');
const sequelize = require('../utils/database');

const INTEGER = DataTypes.INTEGER;
const STRING = DataTypes.STRING;
const BOOLEAN = DataTypes.BOOLEAN;

const MasterData = sequelize.define('MasterData', {
    id: {
        type: INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    type: {
        type: STRING,
        allowNull: false
    },
    value: {
        type: STRING,
        allowNull: false
    },
    order: {
        type: INTEGER,
        allowNull: false
    },
    active: {
        type: BOOLEAN,
        defaultValue: true
    }
}, {
    tableName: 'MasterData'
});

module.exports = MasterData