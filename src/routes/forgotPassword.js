const express = require('express');
const router = express.Router();
const controller = require('../../controllers/controller');

router.get('/forgot_password',controller.getForgotPassword);
router.post('/forgot_password',controller.postForgotPassword);
router.post('/forgot_password/OTP',controller.postOTP);
router.post('/forgot_password/resetPassword',controller.postResetPassword);

module.exports = router;