const { DataTypes } = require('sequelize');
const sequelize = require('../utils/database');

const Role = require('./role');

const INTEGER = DataTypes.INTEGER;
const BOOLEAN = DataTypes.BOOLEAN;

const UserRole = sequelize.define('UserRole', {
    id: {
        type: INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    userId: {
        type: INTEGER,
        allowNull: false,
        references: {
            model: 'User',
            key: 'id'
        },
        foreignKey: true
    },
    roleId: {
        type: INTEGER,
        allowNull: false,
        references: {
            model: 'Role',
            key: 'id'
        },
        foreignKey: true
    },
    active: {
        type: BOOLEAN,
        allowNull: false,
    }
},{
    tableName: 'UserRole'
});

UserRole.belongsTo(Role, { foreignKey: 'roleId' });

module.exports = UserRole;