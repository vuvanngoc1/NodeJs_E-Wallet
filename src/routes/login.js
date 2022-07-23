const express = require('express');
const router = express.Router();
const controller = require('../../controllers/controller');
const loginValidation = require('../validation/login');
const {validationResult} = require('express-validator');

router.get('/login',controller.getLogin);
router.post('/login',loginValidation,controller.postLogin);

module.exports = router;