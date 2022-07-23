const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const account = new Schema({
  username: String,
  password: String,
  fullname: String,
  phone:String,
  email:String,
  birthday:String,
  address:String,
  frontIdCard:String,
  backIdCard:String,
  firstTimeLogin:Boolean,
  balance: String,
  status: String,
  temporaryLock: Boolean,
  note: String,
  dateTimeBlockAccount: String,
  historyRecharge:String,
  historyWithdraw:String,
  historyTransfer:String,
  historyBuyCard:String,
  timeWithdraw: String,
  transactionAmount:String,
  isAdmin:Boolean,
  dateCreate:String
});

module.exports = mongoose.model('Account', account);