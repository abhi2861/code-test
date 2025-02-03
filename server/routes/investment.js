const express = require('express');
const router = express();

const investmentOpportunity = require("../controllers/investmentOpportunity")

router.post('/createInvestmentOpportunity', investmentOpportunity.createInvestmentOpportunity);

router.get('/getInvestmentOpportunity', investmentOpportunity.getInvestmentOpportunity);

router.delete('/deleteInvestmentOpportunity', investmentOpportunity.deleteInvestmentOpportunity);

router.post('/createUserInvestment', investmentOpportunity.createUserInvestment);

router.get('/getUserInvestment', investmentOpportunity.getUserInvestment);

router.delete('/opportunityRejection', investmentOpportunity.opportunityRejection)

router.get('/getAllUserInvestment', investmentOpportunity.getAllUserInvestment);

router.post('/endInvestmentOpportunity', investmentOpportunity.endInvestmentOpportunity);

router.get('/getAllInvestmentOpportunity', investmentOpportunity.getAllInvestmentOpportunity);

router.post('/updateUserInvestment', investmentOpportunity.updateUserInvestment);

router.post('/getInvestmentDeatils', investmentOpportunity.getInvestmentDeatils);

router.post('/createNote', investmentOpportunity.createNote);

router.post('/deleteNote', investmentOpportunity.deleteNote);

module.exports = router;