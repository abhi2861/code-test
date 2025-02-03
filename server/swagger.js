const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });
const swaggerAutogen = require('swagger-autogen')()

const doc = {
    info: {
        title: 'Lp Investment API Documentation',
        description: 'Description'
    },
    host: process.env.SWAGGER_HOST
};

const outputFile = './swagger-output.json'
const routes = ['./router'];

swaggerAutogen(outputFile, routes, doc).then(() => {
    require('./app').default; //compliant
}).catch((err) => {
    throw new Error(err)
})
