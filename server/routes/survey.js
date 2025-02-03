const express = require('express');
const router = express();

const survey = require("../controllers/survey")

router.post('/createInterestSurvey', survey.createInterestSurvey);

router.get('/getInterestSurvey', survey.getInterestSurvey);

router.post('/createInterestCapture', survey.createInterestCapture);

router.post('/getInterestCapture', survey.getInterestCapture);

router.get('/getAllSurvey', survey.getAllSurvey);

module.exports = router;