const {check} = require('express-validator');

module.exports = [
    check('cardnumber')
    .exists().withMessage('You must enter all fields')
    .notEmpty().withMessage('You must enter all fields')
    .isLength({min:6,max:6}).withMessage('Card number must be 6 digits'),

    check('expiry')
    .exists().withMessage('You must enter all fields')
    .notEmpty().withMessage('You must enter all fields'),

    check('cvvcode')
    .exists().withMessage('You must enter all fields')
    .notEmpty().withMessage('You must enter all fields')
    .isLength({min:3,max:3}).withMessage('Card number must be 3 digits')
]