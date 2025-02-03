const express = require('express');
const router = express();

const company = require("../controllers/company")

router.post('/companyCreate', company.companyCreate);

router.get('/getCompany', company.getCompany);

router.delete('/deleteCompany', company.deleteCompany);

router.get('/getDetailsByCompanyId', company.getDetailsByCompanyId);

router.post('/updateFMV', company.updateFMV);

router.get('/getAllCompany', company.getAllCompany);

router.get('/getTeam', company.getTeam);

module.exports = router;