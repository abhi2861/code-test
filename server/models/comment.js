const { DataTypes, ENUM } = require('sequelize');
const sequelize = require('../utils/database');
const User = require('./user');
const investmentOpportunity = require('./investmentOpportunity')

const INTEGER = DataTypes.INTEGER;
const STRING = DataTypes.STRING;
const BOOLEAN = DataTypes.BOOLEAN;

const Comment = sequelize.define('Comment', {
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
    investmentId: {
        type: INTEGER,
        allowNull: false,
    },
    comment: {
        type: STRING,
        allowNull: true
    },
    subscribe: {
        type: ENUM,
        values: ['Yes', 'No'],
        defaultValue: null
    },
    active: {
        type: BOOLEAN,
        defaultValue: true
    }
}, {
    tableName: 'Comment',
    timestamps: true
});

Comment.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(Comment, { foreignKey: 'userId' });
investmentOpportunity.belongsTo(Comment, { foreignKey: 'investmentId' });
Comment.hasMany(investmentOpportunity, { foreignKey: 'investmentId' });

module.exports = Comment;
