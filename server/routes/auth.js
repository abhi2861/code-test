const express = require('express');
const router = express.Router();

const authController = require('../controllers/auth');

router.get('/googleAuth', authController.googleAuth);

router.get('/azureAuth', authController.azureAuth);

router.post('/auth', authController.auth);

router.get('/logout', authController.logout);

router.post('/signup', authController.userSignup);

router.get('/getPartnerDetails', authController.getPartnerDetails);

module.exports = router;
