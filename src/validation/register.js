const {check} = require('express-validator');

module.exports = [
    check('fullname')
    .exists().withMessage('Please enter your full name')
    .notEmpty().withMessage('Please enter your full name'),

    check('phone')
    .exists().withMessage('Please enter your phone number')
    .notEmpty().withMessage('Please enter your phone number'),

    check('email')
    .exists().withMessage('Please enter your email')
    .notEmpty().withMessage('Please enter your email')
    .isEmail().withMessage('Your email address is invalid'),

    check('birthday')
    .exists().withMessage('Please enter your birthday')
    .notEmpty().withMessage('Please enter your birthday'),

    check('address')
    .exists().withMessage('Please enter your address')
    .notEmpty().withMessage('Please enter your address'),

    check('frontIdCard')
    .exists().withMessage('Please upload your front side of id card')
    .notEmpty().withMessage('Please upload your front side of id card'),

    check('backIdCard')
    .exists().withMessage('Please upload your back side of id card')
    .notEmpty().withMessage('Please upload your back side of id card')
]