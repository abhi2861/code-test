const express = require('express');
const router = express();

const admin = require("../controllers/admin")

router.get('/getActiveApplications', admin.getActiveApplications);

router.post('/updateApplicationStatus', admin.updateApplicationStatus);

router.delete('/deleteUserInvestment', admin.deleteUserInvestment);

module.exports = router;