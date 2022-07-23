const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const accountModel = require('../../models/account');
const creditCard = require('../../models/creditCard');
const transactionValidation = require('../validation/transaction');
const {validationResult} = require('express-validator');
const nodemailer = require("nodemailer");

router.post('/receiver',(req,res)=>{
    const phone = req.body.phone;

    accountModel.find({phone})
    .then((user)=>{
        if(user.length>0){
            res.json({code:0,msg:user[0].fullname});
        }else{
            res.json({code:1,msg:"This user was not found"})
        }
    })
});

router.post('/transaction',transactionValidation,(req,res)=>{
    const username = req.body.username;
    const phone = req.body.phone;
    const money = req.body.money;
    const note = req.body.msg;
    const feeBearer = req.body.feeBearer;
    const sender = req.body.sender;
    const receiver = req.body.receiver;

    const R = validationResult(req);

    if(R.errors.length>0){
        return res.json({code: 1,msg:(R.errors)[0].msg})
    }else{
        const fee = (money/100)*5;
        const transactionMoneyWithFee = money*1+fee;

        if(transactionMoneyWithFee <= 5000000){
            const IDSend = `S${Math.floor(Math.random()*20000)}`;
            const IDReceive = `R${Math.floor(Math.random()*20000)}`;
            const currentDate = new Date();

            let transactionInforOfSender = {
                ID:IDSend,
                transactionOwner: sender,
                transactionFee: fee,
                message: `Send ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(money*1)} to ${receiver}`,
                note,
                status:'Success',
                date: `${currentDate.getDate()}/${currentDate.getMonth()+1}/${currentDate.getFullYear()}`,
                transactionAmount:money
            }

            let transactionInforOfReceiver = {
                ID:IDReceive,
                transactionOwner: sender,
                transactionFee: fee,
                message: `Receive ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(money*1)} From ${sender}`,
                note,
                status:'Success',
                date: `${currentDate.getDate()}/${currentDate.getMonth()+1}/${currentDate.getFullYear()}`,
                transactionAmount:money
            }

            accountModel.find({phone})
                .then((Receiver)=>{
                    if(transactionInforOfSender)
                    if(Receiver.length>0){
                        let historyTransfer = [];
                        if(Receiver[0].historyTransfer == ''){
                            historyTransfer = JSON.stringify([transactionInforOfReceiver]);
                        }else{
                            const oldTrans = JSON.parse(Receiver[0].historyTransfer)
                            historyTransfer = JSON.stringify([transactionInforOfReceiver,...oldTrans])
                        }

                        let balanceReceiver = '';
                        if(feeBearer == true){
                            balanceReceiver = Receiver[0].balance*1 + money*1;
                        }else if(feeBearer == false){
                            balanceReceiver = Receiver[0].balance*1 + (money*1-fee);
                        }

                        accountModel.findOneAndUpdate({phone}, {$set: {balance: balanceReceiver,historyTransfer}})
                            .then(()=>{

                                accountModel.find({username})
                                .then(Sender=>{
                                    let historyTransfer = [];
                                    if(Sender[0].historyTransfer == ''){
                                        historyTransfer = JSON.stringify([transactionInforOfSender]);
                                    }else{
                                        const oldTrans = JSON.parse(Sender[0].historyTransfer)
                                        historyTransfer = JSON.stringify([transactionInforOfSender,...oldTrans])
                                    }
                                    
                                    let balanceSender = '';
                                    if(feeBearer == true){
                                        balanceSender = Sender[0].balance*1 - transactionMoneyWithFee*1;
                                    }else if(feeBearer == false){
                                        balanceSender = Sender[0].balance*1 - money*1;
                                    }

                                    accountModel.findOneAndUpdate({username}, {$set: {balance: balanceSender,historyTransfer}})
                                    .then(()=>{
                                        sendStatus(Sender[0].email,transactionInforOfSender.message);
                                        sendStatus(Receiver[0].email,transactionInforOfReceiver.message);

                                        return res.json({code: 0,msg:"Successfully transaction"})
                                    })
                                })

                            })
                    }
                })
        }else{
            const IDSend = `S${Math.floor(Math.random()*20000)}`;
            const currentDate = new Date();

            let transactionInforOfSender = {
                ID:IDSend,
                transactionOwner: sender,
                transactionFee: fee,
                message: `Send ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(money*1)} to ${receiver}`,
                note,
                status:'Waiting',
                date: `${currentDate.getDate()}/${currentDate.getMonth()+1}/${currentDate.getFullYear()}`,
                transactionAmount:money
            }

            accountModel.find({username})
            .then((Sender) => {
                if(Sender.length > 0){
                    let historyTransfer = [];
                    if(Sender[0].historyTransfer == ''){
                        historyTransfer = JSON.stringify([transactionInforOfSender]);
                    }else{
                        const oldTrans = JSON.parse(Sender[0].historyTransfer)
                        historyTransfer = JSON.stringify([transactionInforOfSender,...oldTrans])
                    }

                    accountModel.findOneAndUpdate({username},{$set: {historyTransfer}})
                    .then(()=>{
                        return res.json({code: 10,msg:"Wait for the admin to accept the withdrawal request"})
                    })
                }
            })
        }
    }
});

router.post('/getOTP',(req,res)=>{
    const email = req.body.email;
    const OTP = generateOTP();
    mailOTP(email,OTP);
    res.json({OTP})
})

function generateOTP() {
    var digits = '0123456789';
    let OTP = '';
    for (let i = 0; i < 6; i++ ) {
        OTP += digits[Math.floor(Math.random() * 10)];
    }
    return OTP;
}

async function mailOTP(emailReceived,OTP){
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
        subject: "OTP for transaction", // Subject line
        text: `OTP code for transaction verification: ${OTP}`, // plain text body
        html: `<div><b>OTP code for transaction verification:${OTP}</b></div>`, // html body
    })
}

async function sendStatus (emailReceived,message) {
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
        subject: "Balance fluctuations", // Subject line
        text: message, // plain text body
        html: `<div>${message}</div>`, // html body
    })
}

module.exports = router;