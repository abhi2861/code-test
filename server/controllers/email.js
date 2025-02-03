const nodemailer = require('nodemailer');
const crypto = require('crypto');
const { Op } = require('sequelize');
const moment = require('moment-timezone');
const catchAsync = require('../utils/catchAsync');
require('dotenv').config({ path: "./config.env" });
const bcrypt = require('bcrypt');

const Notification = require('../models/notification');
const shared = require('../controllers/shared');
const AppError = require('../utils/appError');
const Email = require('../models/email')

const User = require('../models/user');

const generateOTP = () => {
    return crypto.randomInt(100000, 1000000).toString();
};

exports.sendEmail = async (email, from, subject, text, html) => {

    let transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });
    try {
        const data = await transporter.sendMail({
            from: `${from} <${process.env.EMAIL_USER}>`,
            to: email,
            subject: subject,
            text: text,
            html: html
        });
        return data;
    } catch (error) {
        throw new AppError(`Error sending email`, 400);
    }
};

exports.sendOtp = catchAsync(async (req, res) => {
    let json = {
        email: req.body.email,
        userId: req.body.userId
    }
    await shared.validateRequestBody(json);

    const otp = generateOTP();
    const expirationTimePacific = moment.tz('America/Los_Angeles').add(10, 'minutes');

    // Step 2: Convert the expiration time to UTC
    const expirationTimeUTC = shared.convertPacificTimeToUTCWithDate(expirationTimePacific);
    await Notification.create({
        otp,
        type: 'OTP',
        userId: json.userId,
        email: json.email,
        expirationTime: expirationTimeUTC,
        verified: false
    });

    await this.sendEmail(json.email, 'Vibhu Venture Partners- Documents Verification Code', 'One time Code to access your Documents', `Please use the OTP ${otp} to access the documents. OTP will be expired in 10 minutes.`, '');

    shared.response(res, '', '', 'OTP sent successfully');

});

exports.verifyOtp = catchAsync(async (req, res) => {
    let json = {
        email: req.body.email,
        otp: req.body.otp

    }
    await shared.validateRequestBody(json);

    const otpEntry = await Notification.findOne({
        where: {
            email: json.email,
            type: 'OTP',
            otp: json.otp,
            expirationTime: { [Op.gt]: new Date() },
            verified: false
        }
    });

    if (!otpEntry) {
        throw new AppError('Invalid or expired OTP', 400);
    }

    otpEntry.verified = true;
    await otpEntry.save();
    shared.response(res, '', '', 'OTP verified successfully');
});

exports.sendEmailToUser = catchAsync(async (req, res) => {
    let json = {
        email: req.body.email,
        userId: req.body.userId,
        emailSubject: req.body.emailSubject,
        emailBody: req.body.emailBody,
        loggedInUserId: req.body.loggedInUserId
    }
    await shared.validateRequestBody(json);

    // Create a Email record in the database
    const email = await Email.create({
        userId: json.userId,
        sentById: json.loggedInUserId,
        emailFrom: `${process.env.EMAIL_USER}`,
        emailTo: json.email,
        subject: json.emailSubject,
        body: json.emailBody,
        sentAt: new Date(),
    });

    if (json.emailSubject && json.emailBody && json.email) {
        let htmlContent = ` <html>
            <head>
                <style>
                    p{
                       margin: 0 
                    }
                </style>
            </head>
            <body>
                ${json.emailBody}
            </body>
        </html>`
        await this.sendEmail(json.email, 'Vibhu Venture Partners', `${json.emailSubject}`, '', `${htmlContent}`);

        // update a Email record if its successfully sent
        await Email.update({ isSent: true }, { where: { id: email.id } });

    }
    shared.response(res, '', '', 'Email sent successfully');

})

// Route to request password reset
exports.requestResetPassword = catchAsync(async (req, res) => {
    let json = {
        email: req.body.email
    }
    await shared.validateRequestBody(json);

    const user = await User.findOne({ where: { email: json.email } });

    if (!user) {
        return res.status(404).send('User not found.');
    }

    // Generate reset token
    const token = crypto.randomBytes(20).toString('hex');
    const expirationTimePacific = moment.tz('America/Los_Angeles').add(2, 'hours');

    // Step 2: Convert the expiration time to UTC
    const expirationTimeUTC = shared.convertPacificTimeToUTCWithDate(expirationTimePacific);

    // Store token and expiration in the database
    await user.update({
        resetPasswordToken: token,
        resetPasswordExpires: expirationTimeUTC
    });

    await this.sendEmail(json.email,
        'Vibhu - Reset Password',
        'Reset Password',
        `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n
      Please click on the following link, or paste this into your browser to complete the process:\n\n
      ${process.env.UI_BASE_URL}/changepassword?email=${json.email}&resetToken=${token}\n\n   
      This link will expire in 2 hours.\n\n
      If you did not request this, please ignore this email and your password will remain unchanged.\n`,
        '');

    shared.response(res, '', '', 'Password reset link sent.');
});

exports.resetPassword = catchAsync(async (req, res) => {
    let obj = {};
    let json = {
        token: req.params.token,
        newPassword: req.body.newPassword,
        confirmPassword: req.body.confirmPassword,
        email: req.body.email
    }
    await shared.validateRequestBody(json, ['token']);

    if (json.newPassword !== json.confirmPassword) {
        throw new AppError('New password and confirm password do not match.', 400);
    }

    obj['email'] = json.email;
    if (json.token) {
        obj['resetPasswordToken'] = json.token;
        obj['resetPasswordExpires'] = {
            [Op.gt]: new Date()
        }
    }

    const user = await User.findOne({
        where: obj
    });

    if (!user) {
        throw new AppError('Password reset token is invalid or has expired.', 400);
    }

    if (user.password) {
        // Compare old and new passwords
        const isSamePassword = await bcrypt.compare(json.newPassword, user.password);
        if (isSamePassword) {
            throw new AppError('New password must be different from the old password.', 400);
        }
    }

    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(json.newPassword, saltRounds);

    // Update user's password
    await user.update(
        {
            password: hashedPassword,
            resetPasswordToken: null,
            resetPasswordExpires: null
        },
        { where: { id: user.id } }
    );
    shared.response(res, '', '', 'Password has been reset.');
});