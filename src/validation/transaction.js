const {check} = require('express-validator');

module.exports = [
    check('phone')
    .exists().withMessage('Please enter phone number')
    .notEmpty().withMessage('Please enter phone number'),

    check('money')
    .exists().withMessage('Please enter the amount of money')
    .notEmpty().withMessage('Please enter the amount of money')
]