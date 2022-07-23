const {validationResult} = require('express-validator');
const mongoose = require('mongoose');
const accountModel = require('../models/account');
const creditCard = require('../models/creditCard');
const nodemailer = require("nodemailer");

let currentLogin = {
    username: '',
    timeWrong: 0
};

let OTP = '';


class NewController{
    getRegister(req,res){
        res.render('register',{errorMsg: "",dataRegister:{},success:false,account:{}})
    }

    postRegister(req,res){
        const dataRegister = req.body;
        const result = validationResult(req);

        if(result.errors.length > 0){
            let errors = result.mapped();

            let message = '';
            for( let msg in errors){
                message = errors[msg].msg;
                break;
            }

            res.render('register',{errorMsg: message,dataRegister,account:{},success:false});
        }else{
            let msg = '';
            let success = true;
            const username = makeUsername();
            const password = makePassword();

            let account = {
                username,
                password
            };

            accountModel.find({})
            .then(data=>{
                if(data.length>0){
                    let dtReg = {};
                    for(let i = 0; i < data.length; i++){
                        if(dataRegister.email == data[i].email){
                            msg = 'Your email has been registered';
                            success = false;
                            dtReg = dataRegister;
                            break;
                        }else if(dataRegister.phone == data[i].phone){
                            msg = 'Your phone number has been registered';
                            dtReg = dataRegister;
                            success = false;
                            break;
                        }else if(account.username == data[i].username || account.password == data[i].password){
                            account = {
                                username: makeUsername(),
                                password: makePassword()
                            }
                            break;
                        }
                    }
                    const currentDate = new Date();
                    const dateCreate =  `${currentDate.getDate()}-${currentDate.getMonth()+1}-${currentDate.getFullYear()}`;

                    if(msg == ''){
                        accountModel.create({...account,...dataRegister,firstTimeLogin:true,balance:50000,status: "Waiting for verification",temporaryLock:false,note:'',historyRecharge:'',historyWithdraw:'',historyTransfer:'',timeWithdraw:"",transactionAmount:"",isAdmin:false,dateCreate,historyBuyCard:""});  
                        mailGetAccount(dataRegister.email,account)
                    }
                    res.render('register',{errorMsg: msg,dataRegister:dtReg,account,success});
                }else{
                    accountModel.create({...account,...dataRegister,firstTimeLogin:true,balance:50000,status: "Waiting for verification",temporaryLock:false,note:'',historyRecharge:'',historyWithdraw:'',historyTransfer:'',timeWithdraw:"",transactionAmount:"",isAdmin:false,dateCreate,historyBuyCard:""});  
                    mailGetAccount(dataRegister.email,account);
                    res.render('register',{errorMsg: msg,dataRegister: {},account,success});
                }
            })
        }
    }

    getLogin(req, res) {
        req.session.destroy();
        res.render('login',{errorMsg: "",dataRegister:{},disabled:false,locked:false});
    }

    postLogin(req, res) {
        const dataRegister = req.body;
        const result = validationResult(req);

        if(result.errors.length > 0){
            let errors = result.mapped();

            let message = '';
            for( let msg in errors){
                message = errors[msg].msg;
                break;
            }

            res.render('login',{errorMsg: message,dataRegister,disabled:false,locked:false});
        }else{
            accountModel.find({username: dataRegister.username})
            .then(dataUser=>{
                if(dataUser.length > 0){
                        if(dataRegister.username == dataUser[0].username && dataRegister.password == dataUser[0].password){
                            if(dataUser[0].status == 'Account has been disabled'){
                                return res.render('login',{errorMsg: "",dataRegister,disabled:true,locked:false});
                            }else{
                                req.session.account = dataRegister;
                                unBlockUser(dataRegister.username);
                                if(dataUser[0].isAdmin == true){
                                    res.redirect('/Admin');
                                }else{
                                    res.redirect('/');
                                }
                            }
                        }else{
                            if(dataRegister.username == dataUser[0].username && dataRegister.password != dataUser[0].password){
                                if(dataUser[0].temporaryLock == true){
                                    return res.render('login',{errorMsg: "",dataRegister,disabled:false,locked:true});
                                }else if(dataUser[0].status == 'Account has been disabled'){
                                    return res.render('login',{errorMsg: "",dataRegister,disabled:true,locked:false});
                                }else{
                                    if(currentLogin.username == dataRegister.username){
                                        currentLogin.username = dataRegister.username;
                                        currentLogin.timeWrong++;
                                    }else{
                                        currentLogin.username = dataRegister.username;
                                        currentLogin.timeWrong=1;
                                    }
        
                                    // console.log(currentLogin)
        
                                    if(currentLogin.timeWrong == 3){
                                        accountModel.find({username:currentLogin.username})
                                            .then((data)=>{
                                                if(data[0].note == 'Abnormal login'){
                                                    accountModel.findOneAndUpdate({username:currentLogin.username} 
                                                        , {$set: {status:'Account has been disabled',dateTimeBlockAccount:getCurrentDate()}})
                                                        .then(()=>{
                                                            console.log(`Account ${currentLogin.username} is disabled!!`);
                                                        })
                                                        .catch((e)=>{
                                                            console.log(e);
                                                        })
                                                }
                                            })
                                            .catch((e)=>{
                                                console.log(e);
                                            })
                                        if(dataUser[0].note == 'Abnormal login'){
                                            return res.render('login',{errorMsg: "",dataRegister,disabled:true,locked:false});
                                        }else{
                                            let userBlock = currentLogin.username;
                                            blockUser(userBlock);
                                            currentLogin = {
                                                username: '',
                                                timeWrong: 0
                                            };
                                        }
                                    }
                                }
                            }
                            return res.render('login',{errorMsg: "Your username or password is incorrect",dataRegister,disabled:false,locked:false});
                        }
                }else{
                    return res.render('login',{errorMsg: "Your username or password is incorrect",dataRegister,disabled:false,locked:false});
                }
            })
        }
    }

    getForgotPassword(req, res){
        req.session.destroy();
        res.render('forgotPassword',{msg:"",email:"",phone:"",dialog:false});
    }

    postForgotPassword(req, res){
        const email = req.body.email;
        const phone = req.body.phone;
        accountModel.find({email})
        .then((dataUser) => {
            if(dataUser.length > 0){
                if(dataUser[0].phone == phone){
                    OTP = makeOTP();
                    mailResetPass(email,OTP);
                    res.render('forgotPassword',{msg:"",email,phone,dialog:true});
                }else{
                    res.render('forgotPassword',{msg:"This phone number is haven't been registered",email,phone,dialog:false});
                }
            }else{
                res.render('forgotPassword',{msg:"This email haven't been registered",email,phone,dialog:false});
            }
        })
    }

    postOTP(req,res){
        const OTPInput = req.body.OTP;
        if(OTPInput == OTP){
            res.json({code:0});
        }else{
            res.json({code:1});
        }
    }

    postResetPassword(req,res){
        const newPass = req.body.password;
        const email = req.body.email;
        accountModel.findOneAndUpdate({email} , {$set: {password:newPass}})
            .then((data)=>{
                res.json({code:0});
            })
            .catch(err => {
                res.json({code:1});
            })
    }

    getHome(req, res) {
        const user = req.session.account;
        
        if(user){
            accountModel.find({username : user.username})
            .then((data) => {
                if(data){
                    if(data[0].firstTimeLogin == true){
                        res.redirect('/firstLogin');
                    }else{
                        const balanceInNum = data[0].balance;

                        let balanceInAlph = '';

                        const changeBalanceNumToAlpha = (Num)=>{
                            let result = [];
                            let current = Num;
                    
                            while(current != 0){
                                if(current%1000 == 0){
                                    result.unshift(`000`);
                                }else{
                                    result.unshift(`${current%1000}`);
                                }
                                current = Math.floor(current/1000);
                            }
                    
                            return result.join(',');
                        }
                    
                        balanceInAlph = changeBalanceNumToAlpha(balanceInNum);
                        res.render('home',{dataUser:data[0],balanceInAlph});
                    }
                }
            })
        }else{
            req.session.destroy();
            res.redirect('/login');
        }
    }

    getFirstLogin(req, res) {
        const user = req.session.account;
        if(user){
            accountModel.find({username : user.username})
            .then((data) => {
                if(data){
                    if(data[0].firstTimeLogin == true){
                        res.render('changePassFirstLogin');
                    }else{
                        res.redirect('/');
                    }
                }
            })
        }else{
            req.session.destroy();
            res.redirect('/login');
        }
    }

    postFirstLogin(req, res){
        const newPass = req.body.password;
        const user = req.session.account;

        accountModel.findOneAndUpdate({username : user.username} , {$set: {password:newPass,firstTimeLogin:false}})
            .then((data)=>{
                req.session.account = {username: user.username,password:newPass};
                res.redirect('/');
            })
            .catch(err => {
                req.session.destroy();
                res.render('/login');
            })
    }

    postLoadingMoney(req,res){
        const cardnumber = req.body.cardnumber;
        const expiry = req.body.expiry;
        const cvvcode = req.body.cvvcode;
        const moneyRecharge = req.body.moneyRecharge;
        const emailUser = req.body.emailUser;

        creditCard.find({cardnumber})
        .then(data=>{
            if(data.length>0){
                if(cvvcode != data[0].cvvcode){
                    res.json({code:2,message:"Cvv code is incorrect"});
                }else{
                    if(checkDayExpiry(expiry,data[0].expiry) == ''){

                        if(cardnumber === '222222'){
                            if(moneyRecharge > 1000000){
                                res.json({code:4,message:"This card can only be loaded up to 1 million each time"});
                            }
                        }else if(cardnumber === '333333'){
                            res.json({code:5,message:"This card is out of money"});
                        }else{
                            accountModel.find({email:emailUser})
                            .then((user)=>{
                                const currentBalance = user[0].balance;
                                const newBalance = currentBalance*1+moneyRecharge*1;
                                accountModel.findOneAndUpdate({email:emailUser}
                                    , {$set: {balance: newBalance}})
                                    .then(()=>{
                                        let historyRecharge = [];
                                        const ID = `RC${Math.floor(Math.random()*20000)}`;
                                        const transactionOwner = user[0].fullname;
                                        const transactionFee = '0 đ';
                                        const currentDate = new Date();
                                        const moneyInVND = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(moneyRecharge*1);

                                        const rechargeInfor = {
                                            ID,
                                            transactionOwner,
                                            transactionFee,
                                            status:"Success",
                                            message: `Successfully loaded ${moneyInVND} into the wallet`,
                                            date: `${currentDate.getDate()}/${currentDate.getMonth()+1}/${currentDate.getFullYear()}`,
                                            transactionAmount:moneyRecharge
                                        }

                                        if(user[0].historyRecharge == ''){
                                            historyRecharge = JSON.stringify([rechargeInfor]);
                                        }else{
                                            const oldHis = JSON.parse(user[0].historyRecharge);
                                            historyRecharge = JSON.stringify([rechargeInfor,...oldHis]);
                                        }
                                        
                                        accountModel.findOneAndUpdate({email:emailUser}
                                            , {$set: {historyRecharge}})
                                            .then(()=>{
                                                res.json({code:0,message:"Success rechange",user:user[0]});
                                            })
                                    })
                                    .catch((e)=>{
                                        console.log(e);
                                        res.json({code:0,message:"Fail to rechange"});
                                    })
                            })
                        }
                    }else{
                        res.json({code:3,message:checkDayExpiry(expiry)});
                    }
                }
            }else{
                res.json({code:1,message:"This card is not supported"});
            }
        })
    }
}

const checkDayExpiry = (expiry,expiryInData)=>{
    const msg  = "Your card has expired";

    const expiryYear = expiry.split('/')[2]*1;
    const expiryMonth = expiry.split('/')[1]*1;
    const expiryDay = expiry.split('/')[0]*1;

    const currentDate = new Date();
    const currentDay = currentDate.getDate()*1;
    const currentMonth = currentDate.getMonth()*1+1;
    const currentYear = currentDate.getFullYear()*1;
    if(expiry != expiryInData){
        return "Wrong expiry date";
    }
    if(expiryYear<currentYear){
        return msg;
    }else{
        if(expiryMonth<currentMonth){
            return msg;
        }else if(expiryMonth==currentMonth){
            if(expiryDay<currentDay){
                return msg;
            }
        }
    }
    return '';
}

const makeUsername = () => {
    let username = [];
    for(let i = 0;i<9;i++){
        if(i==0){
            let randNum = 0;
            while(randNum == 0){
                randNum = Math.floor(Math.random() * 10);
            }
            username.push(randNum)
        }
        username.push(Math.floor(Math.random() * 10))
    }
    username = username.join('');
    return username;
}

const makePassword = ()=>{
    let password = [];
    let lettersNum = [];
    for(let i=65; i<91;i++){
        lettersNum.push(i);
    }
    for(let j=97; j<123;j++){
        lettersNum.push(j);
    }
    for(let h = 0;h<=5;h++){
        let randNum = Math.floor(Math.random() * 53);
        if(randNum == undefined){
            randNum = Math.floor(Math.random() * 53);
        }
        password.push(String.fromCharCode(lettersNum[randNum]));
    }
    return password.join('');
}

const makeOTP = ()=>{
    let OTP = [];
    let lettersNum = [];
    for(let i=65; i<91;i++){
        lettersNum.push(i);
    }
    for(let j=97; j<123;j++){
        lettersNum.push(j);
    }
    for(let h = 0;h<=5;h++){
        let randNum = Math.floor(Math.random() * 53);
        if(randNum == undefined){
            randNum = Math.floor(Math.random() * 53);
        }
        OTP.push(String.fromCharCode(lettersNum[randNum]));
    }
    return OTP.join('');
}

async function mailGetAccount(emailReceived,account){
    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: "E.Wallet.ForSend@gmail.com",
            pass: "123456a#"
        },
        tls: {
            rejectUnauthorized: false
        }
    });

    // send mail with defined transport object
    await transporter.sendMail({
        from: 'E.Wallet.ForSend@gmail.com', // sender address
        to: emailReceived, // list of receivers
        subject: "Get account", // Subject line
        text: `Your account information is: \nusername: ${account.username};\npassword: ${account.password}`, // plain text body
        html: `<div><b>Your account information is:</b></div>
                <div><b>username: ${account.username};</b></div>
                <div><b>password: ${account.password}</b></div>`, // html body
    })
}

async function mailResetPass(emailReceived,OTP){
    let transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: "E.Wallet.ForSend@gmail.com",
            pass: "123456a#"
        },
        tls: {
            rejectUnauthorized: false
        }
    });

    // send mail with defined transport object
    await transporter.sendMail({
        from: 'E.Wallet.ForSend@gmail.com', // sender address
        to: emailReceived, // list of receivers
        subject: "OTP for reset password", // Subject line
        text: `Your OTP to reset your password is: \npassword: ${OTP}`, // plain text body
        html: `<div><b>Your OTP to reset your password is: ${OTP}</b></div>` //html body
    })
}

const blockUser = (username)=>{
    accountModel.findOneAndUpdate({username} 
        , {$set: {temporaryLock:true}})
        .then(()=>{
            accountModel.findOneAndUpdate({username} 
                , {$set: {note:'Abnormal login'}})
                .then(()=>{
                    console.log(`Account ${username} is locked!!`)
                })
                .catch((e)=>{
                    console.log(e)
                })
        })
        .catch((e)=>{
            console.log(e)
        })
    setTimeout(()=>{
        accountModel.findOneAndUpdate({username} 
            , {$set: {temporaryLock:false}})
            .then(()=>{
                console.log(`Account ${username} is unlocked!!`)
            })
            .catch((e)=>{
                console.log(e)
            })
    },60000)
}

const unBlockUser = (username)=>{
    accountModel.findOneAndUpdate({username} 
        , {$set: {note:''}})
        .then(()=>{
        })
        .catch((e)=>{
            console.log(e)
        })
}

const getCurrentDate = ()=>{
    let today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    const yyyy = today.getFullYear();

    today = mm + '/' + dd + '/' + yyyy;

    let currentdate = new Date();
    
    const datetime = today+ ";" 
    + currentdate.getHours() + ":" 
    + currentdate.getMinutes() + ":" + currentdate.getSeconds();

    return datetime;
}

module.exports = new NewController;