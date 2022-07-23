const registerRouter = require('./register');
const loginRouter = require('./login');
const homeRouter = require('./home');
const forgotPasswordRouter = require('./forgotPassword');
const changePass = require('./changePass');
const API = require('./API');
const APIPassUser = require('./userChangePass');
const loadingMoney = require('./loadingMoney');
const resetPage = require('./resetPage');
const checkCreditCard = require('./checkCreditCard');
const transaction = require('./transactionMoney');
const buyCard = require('./buyCard');
const history = require('./history');
const Admin = require('./admin');


const Router = (app)=>{
    app.use('/',registerRouter);
    app.use('/',loginRouter);
    app.use('/',homeRouter);
    app.use('/',forgotPasswordRouter);
    app.use('/',changePass);
    app.use('/',API);
    app.use('/',APIPassUser);
    app.use('/',loadingMoney);
    app.use('/',resetPage);
    app.use('/',checkCreditCard);
    app.use('/',transaction);
    app.use('/',buyCard);
    app.use('/',history);
    app.use('/',Admin);
}

module.exports = Router;