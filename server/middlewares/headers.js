const dotenv = require("dotenv")
dotenv.config({ path: "./config.env" });


const setHeaders = (req, res, next) => {

    res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; frame-src 'none';")

    res.setHeader('X-Frame-Options', 'DENY');

    res.setHeader('Access-Control-Allow-Origin', process.env.CORS_ORIGIN);

    res.setHeader('Access-Control-Allow-Methods', '*');

    res.setHeader('Access-Control-Allow-Headers', '*');

    // res.setHeader('Access-Control-Allow-Credentials', true);

    next();

}

module.exports = setHeaders;
