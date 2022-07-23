const {check} = require('express-validator');

module.exports = [
    check('username')
    .exists().withMessage('Please enter your username')
    .notEmpty().withMessage('Please enter your username'),

    check('password')
    .exists().withMessage('Please enter your password')
    .notEmpty().withMessage('Please enter your password')
]