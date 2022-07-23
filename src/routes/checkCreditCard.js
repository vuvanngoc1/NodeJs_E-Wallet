const express = require('express');
const router = express.Router();
const cardValidation = require('../validation/cardInf');
const {validationResult, check} = require('express-validator');
const mongoose = require('mongoose');
const accountModel = require('../../models/account');
const creditCard = require('../../models/creditCard');

router.post('/CheckCreditCard',cardValidation,(req,res)=>{
    req.session.account = {username: req.body.username, password: req.body.password};

    const cardnumber = req.body.cardnumber;
    const expiry = req.body.expiry;
    const cvvcode = req.body.cvvcode;
    const withDrawMoney = req.body.withDrawMoney;
    const note = req.body.note;

    console.log(note)

    const result = validationResult(req);

    if(result.errors.length > 0){
        const msgs = result.errors;
        return res.json({"code":1,msg:msgs[0].msg});
    }else{
        creditCard.find({cardnumber})
        .then((result) =>{
            if(result.length ==0){
                res.json({"code":2,msg:"Invalid information"});
            }else{
                if(result[0].cvvcode == cvvcode){
                    const formatDate = `${expiry.split('-')[2]}/${expiry.split('-')[1]}/${expiry.split('-')[0]}`;
                    if(formatDate == result[0].expiry){
                        accountModel.find({username:req.body.username})
                        .then((user)=>{
                            if(withDrawMoney%50000 == 0){
                                const withDrawMoneyWithFee = withDrawMoney*1 + (withDrawMoney/100)*5;
                                if(withDrawMoneyWithFee > user[0].balance*1){
                                    res.json({"code":6,msg:`The balance in the wallet is not enough`});
                                }else{

                                    let historyWithdraw = [];
                                    const ID = `WD${Math.floor(Math.random()*20000)}`;
                                    const transactionOwner = user[0].fullname;
                                    const transactionFee = `${(withDrawMoney/100)*5} đ`;
                                    const currentDate = new Date();
                                    const moneyInVND = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(withDrawMoney*1);
                                    
                                    let checked = 0;
                                    if(user[0].timeWithdraw != ""){
                                        checked = JSON.parse(user[0].timeWithdraw)[`${currentDate.getDate()}/${currentDate.getMonth()+1}/${currentDate.getFullYear()}`];
                                    }
                                    if(checked == 2){
                                        res.json({"code":6,msg:"Withdrawal request could not be made, because you made 2 withdrawals today"})
                                    }else{
                                        if(withDrawMoneyWithFee <= 5000000){
                                            const rechargeInfor = {
                                                ID,
                                                transactionOwner,
                                                transactionFee,
                                                message: `Withdrawal ${moneyInVND} from wallet`,
                                                note,
                                                status:'Success',
                                                date: `${currentDate.getDate()}/${currentDate.getMonth()+1}/${currentDate.getFullYear()}`,
                                                transactionAmount:withDrawMoney
                                            }
                                            let oldHis = user[0].historyWithdraw;
    
                                            if(oldHis == ''){
                                                historyWithdraw = [rechargeInfor];
                                                historyWithdraw = JSON.stringify(historyWithdraw);
                                            }else{
                                                oldHis = JSON.parse(user[0].historyWithdraw);
                                                historyWithdraw = JSON.stringify([rechargeInfor,...oldHis]);
                                            }
    
                                            let timeWithdraw = {};
                                            if(user[0].timeWithdraw == ""){
                                                timeWithdraw[`${currentDate.getDate()}/${currentDate.getMonth()+1}/${currentDate.getFullYear()}`] = 1;
                                                timeWithdraw = JSON.stringify(timeWithdraw);
                                            }else{
                                                if(JSON.parse(user[0].timeWithdraw)[`${currentDate.getDate()}/${currentDate.getMonth()+1}/${currentDate.getFullYear()}`] == 1){
                                                    timeWithdraw[`${currentDate.getDate()}/${currentDate.getMonth()+1}/${currentDate.getFullYear()}`] = 2;
                                                    timeWithdraw = JSON.stringify(timeWithdraw);
                                                }else{
                                                    timeWithdraw[`${currentDate.getDate()}/${currentDate.getMonth()+1}/${currentDate.getFullYear()}`] = 1;
                                                    timeWithdraw = JSON.stringify(timeWithdraw);
                                                }
                                            }
                                            accountModel.findOneAndUpdate({username:req.body.username}
                                                , {$set: {balance: user[0].balance*1 - withDrawMoneyWithFee*1,historyWithdraw,timeWithdraw}})
                                                .then(()=>{
                                                    res.json({"code":0,msg:'Successful withdrawal'});
                                                })
                                        }else{
                                            const rechargeInfor = {
                                                ID,
                                                transactionOwner,
                                                transactionFee,
                                                message: `Withdraw ${moneyInVND} from wallet`,
                                                status:'Waiting',
                                                date: `${currentDate.getDate()}/${currentDate.getMonth()+1}/${currentDate.getFullYear()}`,
                                                transactionAmount:withDrawMoney
                                            }
                                            let oldHis = user[0].historyWithdraw;
    
                                            if(oldHis == ''){
                                                historyWithdraw = [rechargeInfor];
                                                historyWithdraw = JSON.stringify(historyWithdraw);
                                            }else{
                                                oldHis = JSON.parse(user[0].historyWithdraw);
                                                historyWithdraw = JSON.stringify([rechargeInfor,...oldHis]);
                                            }
                                            
                                            let timeWithdraw = {};
                                            if(user[0].timeWithdraw == ""){
                                                timeWithdraw[`${currentDate.getDate()}/${currentDate.getMonth()+1}/${currentDate.getFullYear()}`] = 1;
                                                timeWithdraw = JSON.stringify(timeWithdraw);
                                            }else{
                                                if(JSON.parse(user[0].timeWithdraw)[`${currentDate.getDate()}/${currentDate.getMonth()+1}/${currentDate.getFullYear()}`] == 1){
                                                    timeWithdraw[`${currentDate.getDate()}/${currentDate.getMonth()+1}/${currentDate.getFullYear()}`] = 2;
                                                    timeWithdraw = JSON.stringify(timeWithdraw);
                                                }else{
                                                    timeWithdraw[`${currentDate.getDate()}/${currentDate.getMonth()+1}/${currentDate.getFullYear()}`] = 1;
                                                    timeWithdraw = JSON.stringify(timeWithdraw);
                                                }
                                            }
                                            accountModel.findOneAndUpdate({username:req.body.username}
                                                , {$set: {historyWithdraw,timeWithdraw}})
                                                .then(()=>{
                                                    res.json({"code":0,msg:'Wait for the admin to accept the withdrawal request'});
                                                })
                                        }
                                    }
                                }
                            }else{
                                res.json({"code":5,msg:"withdrawal amount must be a multiple of 50.000"});
                            }
                        })
                    }else{
                        res.json({"code":4,msg:"Invalid information"});
                    }
                }else{
                    res.json({"code":3,msg:"Invalid information"});
                }
            }
        })
    }
});

module.exports = router;