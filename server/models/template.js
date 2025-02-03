const { DataTypes, STRING } = require('sequelize');
const sequelize = require('../utils/database');

const INTEGER = DataTypes.INTEGER;
const JSON = DataTypes.JSON;
const BOOLEAN = DataTypes.BOOLEAN;

const Template = sequelize.define('Template', {
    id: {
        type: INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    template_id: { //pandadoc template Id
        type: STRING,
        allowNull: false,
    },
    templateName: {
        type: STRING,
    },
    json: {
        type: JSON,
        allowNull: false,
    },
    fields: {
        type: JSON,
        allowNull: false,
    },
    value: {
        type: JSON,
        allowNull: false,
    },
    createdBy: {
        type: INTEGER
    },
    updatedBy: {
        type: INTEGER
    },
    active: {
        type: BOOLEAN,
        defaultValue: true
    }
}, {
    tableName: 'Template'
});

module.exports = Template;