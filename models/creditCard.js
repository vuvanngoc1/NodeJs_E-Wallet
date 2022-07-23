const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const creditCard = new Schema({
    cardnumber:String,
    expiry:String,
    cvvcode:String
});

module.exports = mongoose.model('CreditCard', creditCard);