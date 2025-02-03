const express = require('express');
const router = express();

const authRoute = require('./routes/auth');
const companyRoute = require('./routes/company');
const bulletinRoute = require('./routes/bulletin');
const surveyRoute = require('./routes/survey');
const userRoute = require('./routes/users');
const investmentRoute = require('./routes/investment');
const adminRoute = require('./routes/admin');
const pandadocapisRoute = require('./routes/pandadocapis');
const documentRoute = require('./routes/document');
const emailRoute = require('./routes/email');
const commentRoute = require('./routes/comment');

//  importing middleware
const { authenticateUser } = require('./middlewares/auth')

router.use('/auth', authRoute);

router.use('/bulletin', authenticateUser, bulletinRoute);

router.use('/company', authenticateUser, companyRoute);

router.use('/survey', authenticateUser, surveyRoute);

router.use('/user', authenticateUser, userRoute);

router.use('/investment', authenticateUser, investmentRoute);

router.use('/admin', authenticateUser, adminRoute);

router.use('/pandadocapis', pandadocapisRoute);

router.use('/document', authenticateUser, documentRoute);

router.use('/email', emailRoute);

router.use('/reset', emailRoute);

router.use('/dashboard', companyRoute);

router.use('/comment', authenticateUser, commentRoute);

module.exports = router;
