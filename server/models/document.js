const { DataTypes } = require('sequelize');
const sequelize = require('../utils/database');

const User = require('./user');

const INTEGER = DataTypes.INTEGER;
const STRING = DataTypes.STRING;
const DATE = DataTypes.DATE;
const BOOLEAN = DataTypes.BOOLEAN;

const Document = sequelize.define('Document', {
    id: {
        type: INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    userId: {
        type: INTEGER
    },
    folder_0: {
        type: STRING,
        allowNull: true
    },
    docLink: {
        type: STRING,
        allowNull: true
    },
    uploadedBy: {
        type: INTEGER
    },
    uploadedDate: {
        type: DATE,
        allowNull: true
    },
    fileName: {
        type: STRING,
        allowNull: true
    },
    active: {
        type: BOOLEAN,
        defaultValue: true
    },
    updatedBy: {
        type: INTEGER
    },
    folder_1: {
        type: STRING,
        allowNull: true
    },
}, {
    tableName: 'Document'
});

Document.belongsTo(User, { foreignKey: 'userId' , as: 'User'});
User.hasMany(Document, { foreignKey: 'userId'});
Document.belongsTo(User, { foreignKey: 'uploadedBy', as: 'UploadedByUser' });
User.hasMany(Document, { foreignKey: 'uploadedBy'});

module.exports = Document;