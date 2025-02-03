const express = require('express');
const router = express.Router();

const emailController = require('../controllers/email');

const { authenticateUser } = require('../middlewares/auth');

router.post('/sendOtp', authenticateUser, emailController.sendOtp);

router.post('/verifyOtp', authenticateUser, emailController.verifyOtp);

router.post('/sendEmailToUser', authenticateUser, emailController.sendEmailToUser);

router.post('/requestResetPassword', emailController.requestResetPassword);

router.post('/resetPassword/:token', emailController.resetPassword);

router.post('/changePassword', authenticateUser, emailController.resetPassword);

module.exports = router;
