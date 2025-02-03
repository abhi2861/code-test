const express = require('express');
const router = express.Router();

const bulletinBoardController = require('../controllers/bulletinBoard')

router.post('/createBulletin', bulletinBoardController.createBulletin);

router.get('/getBulletin', bulletinBoardController.getBulletin);

module.exports = router;
