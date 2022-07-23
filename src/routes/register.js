const express = require('express');
const router = express.Router();
const controller = require('../../controllers/controller');
const registerValidation = require('../validation/register');
const {validationResult} = require('express-validator');

router.get('/register',controller.getRegister);
router.post('/register',registerValidation,controller.postRegister);

module.exports = router;