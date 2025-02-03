const express = require('express');
const dotenv = require('dotenv');
const helmet = require('helmet');

const session = require('express-session');

const passport = require('passport');
const headers = require('./middlewares/headers');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger-output.json');
require('./middlewares/googleOauth');
require('./middlewares/azureOauth');

const globalErrorHandler = require("./controllers/error");
const AppError = require('./utils/appError');

const router = require('./router');

const app = express();
dotenv.config({ path: `${__dirname}/config.env` });

app.use(express.json({ limit: '16mb' }));

app.use(helmet());

app.use(headers);

// set up session
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 30 * 60 * 1000 // Maximum age of the session cookie in milliseconds (30 minutes)
    }
}));

app.use(passport.initialize());
app.use(passport.session());

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get('/meta.json', (req, res) => {
    res.json(swaggerDocument);
});


require('./routes/passportAuth')(app)

app.use('/api/v1', router);


app.use('*', (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
