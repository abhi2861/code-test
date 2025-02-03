const dotenv = require("dotenv")
dotenv.config({ path: "./config.env" });

const Sequelize = require('sequelize');

const sequelize = new Sequelize(process.env.DATABASE_NAME, process.env.DATABASE_USER, process.env.DATABASE_PASSWORD, {
    dialect: process.env.DATABASE_DIALECT,
    host: process.env.DATABASE
});

module.exports = sequelize;
