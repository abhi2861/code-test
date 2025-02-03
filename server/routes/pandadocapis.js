const express = require('express');
const router = express();

const pandadocapis = require("../controllers/pandadocapis");

const { authenticateUser } = require('../middlewares/auth');

router.get('/getTemplatesByPandaDoc', authenticateUser, pandadocapis.getTemplatesByPandaDoc);

router.get('/getDetailsByTemplateId', authenticateUser, pandadocapis.getDetailsByTemplateId);

router.get('/getTemplatesByTable', authenticateUser, pandadocapis.getTemplatesByTable);

router.post('/createDocumentByTemplate', authenticateUser, pandadocapis.createDocumentByTemplate);

router.post('/saveTemplateData', authenticateUser, pandadocapis.saveTemplateData);

router.get('/getDocumentStatus', authenticateUser, pandadocapis.getDocumentStatus);

router.get('/getMasterData', pandadocapis.getMasterData);

module.exports = router;