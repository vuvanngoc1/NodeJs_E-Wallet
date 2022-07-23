const e = require('express');
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const accountModel = require('../../models/account');
const creditCard = require('../../models/creditCard');

router.get('/admin',(req,res)=>{
    const admin = req.session.account;

    if(admin){
        accountModel.find({})
        .then((data)=>{
            const accountTotal =  data.length-1;
            const accountWaitting = data.filter((item)=>item.status === 'Waiting for verification').length;
            const accountActive = data.filter((item)=>item.status === 'Verified').length;
            const accountDisabled = data.filter((item)=>item.status === 'Account has been disabled').length;

            const amountAccount = {
                accountTotal,
                accountWaitting,
                accountActive,
                accountDisabled
            }

            let allHis = [];
            data.forEach((item)=>{
                if(item.isAdmin == false){
                    let historyWithdraw = [];
                    let historyTransfer = [];
                    if(item.historyWithdraw != ''){
                        historyWithdraw = JSON.parse(item.historyWithdraw);
                    }
                    if(item.historyTransfer != ''){
                        historyTransfer = JSON.parse(item.historyTransfer);
                    }
                    allHis.push(...historyWithdraw)
                    allHis.push(...historyTransfer);
                }
            })

            allHis = allHis.filter((item)=>item.status == 'Waiting' || item.status == 'Canceled')
            allHis = allHis.sort((a,b) =>{
                let string1 = b.date;
                let string2 = a.date;
                let a1 = new Date(string2.split('/')[2],string2.split('/')[1],string2.split('/')[0]); 
                let b1 = new Date(string1.split('/')[2],string1.split('/')[1],string1.split('/')[0]);
                return b1 - a1;
            })

            allHis.forEach((item)=>{
                item.amountInText =  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.transactionAmount*1);
            })

            res.render('adminHome',{admin,amountAccount,allHis});
        })
    }else{
        res.session.destroy();
        res.redirect('/login');
    }
});

router.get('/accountWaiting',(req,res)=>{
    const admin = req.session.account;

    if(admin){
        accountModel.find({})
        .then((data)=>{
            let allHis = [];
            data = data.filter((item)=> item.isAdmin == false);
            data = data.filter((item)=> item.status == 'Waiting for verification' || item.status == 'Request additional information');
            data = data.sort((a,b) =>{
                let string1 = b.dateCreate;
                let string2 = a.dateCreate;
                let a1 = new Date(string2.split('/')[2],string2.split('/')[1],string2.split('/')[0]); 
                let b1 = new Date(string1.split('/')[2],string1.split('/')[1],string1.split('/')[0]);
                return b1 - a1;
            })

            res.render('accountWaiting',{data});
        })
    }else{
        req.session.destroy();
        res.redirect('/login');
    }
});

router.get('/accountActivated',(req,res)=>{
    const admin = req.session.account;

    if(admin){
        accountModel.find({})
        .then((data)=>{
            let allHis = [];
            data = data.filter((item)=> item.isAdmin == false);
            data = data.filter((item)=> item.status == 'Verified');
            res.render('accountActivated',{data});
        })
    }else{
        req.session.destroy();
        res.redirect('/login');
    }
});

router.get('/accountDisable',(req,res)=>{
    const admin = req.session.account;

    if(admin){
        accountModel.find({})
        .then((data)=>{
            let allHis = [];
            data = data.filter((item)=> item.isAdmin == false);
            data = data.filter((item)=> item.status == 'Account has been disabled' && item.note == 'Do not agree to activate');
            res.render('accountDisable',{data});
        })
    }else{
        req.session.destroy();
        res.redirect('/login');
    }
});

router.get('/accountDisableInfinite',(req,res)=>{
    const admin = req.session.account;

    if(admin){
        accountModel.find({})
        .then((data)=>{
            let allHis = [];
            data = data.filter((item)=> item.isAdmin == false);
            data = data.filter((item)=> item.status == 'Account has been disabled' && item.note == 'Abnormal login');
            res.render('accountDisableInfinite',{data});
        })
    }else{
        req.session.destroy();
        res.redirect('/login');
    }
});

router.get('/withdrawRequest',(req,res)=>{
    const admin = req.session.account;

    if(admin){
        accountModel.find({})
        .then((data)=>{
            let allHis = [];
            data.forEach((item)=>{
                if(item.isAdmin == false){
                    let historyWithdraw = [];
                    let historyTransfer = [];
                    if(item.historyWithdraw != ''){
                        historyWithdraw = JSON.parse(item.historyWithdraw);
                    }
                    if(item.historyTransfer != ''){
                        historyTransfer = JSON.parse(item.historyTransfer);
                    }
                    allHis.push(...historyWithdraw);
                    allHis.push(...historyTransfer);
                }
            })
            allHis = allHis.filter((item)=>item.status == 'Waiting');
            let hisTransfer = allHis.filter((item)=>item.ID[0] == 'S');
            let hisWithdraw = allHis.filter((item)=>item.ID[0] == 'W');

            hisTransfer.forEach((item)=>{
                item.amountInText =  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.transactionAmount*1);
            })
            hisWithdraw.forEach((item)=>{
                item.amountInText =  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.transactionAmount*1);
            })
            res.render('withdrawRequest',{hisTransfer,hisWithdraw});
        })
    }else{
        req.session.destroy();
        res.redirect('/login');
    }
});

router.post('/admin/modified',(req, res)=>{
    const email = req.body.email;

    if(req.body.action == 'disable'){
        accountModel.findOneAndUpdate({email},
            {$set: {status:"Account has been disabled",note:'Do not agree to activate'}})
        .then(()=>{
            res.json({code:0})
        })
    }else if(req.body.action == 'accept'){
        accountModel.findOneAndUpdate({email},
            {$set: {status:"Verified",note:''}})
        .then(()=>{
            res.json({code:0})
        })
    }else if(req.body.action == 'request'){
        accountModel.findOneAndUpdate({email},
            {$set: {status:"Request additional information",note:''}})
        .then(()=>{
            res.json({code:0})
        })
    }
})

router.post('/admin/unlockAccount',(req, res)=>{
    const email = req.body.email;

    accountModel.findOneAndUpdate({email},
        {$set: {status:"Verified",note:''}})
    .then(()=>{
        res.json({code:0})
    })
})

router.post('/admin/transactionRequest',(req, res)=>{
    const fullname = req.body.fullname;
    const action = req.body.action;
    const typeHis = req.body.typeHis;
    const ID = req.body.ID;
    const transactionAmount = req.body.transactionAmount;

    accountModel.find({fullname})
    .then((dataUser)=>{
        if(dataUser.length > 0){
            let allHis = JSON.parse(dataUser[0][typeHis]);
            let newInfTransactions = {};

            allHis.forEach((item)=>{
                if(item.ID == ID){
                    newInfTransactions = item;
                }
            })
            if(action == 'accept'){
                newInfTransactions.status = 'Success';
            }else{
                newInfTransactions.status = 'Cancelled';
            }
            allHis = allHis.filter((item)=>item.ID != ID);
            allHis.push(newInfTransactions);
            return allHis;
        }
    })
    .then((allHis)=>{
        accountModel.find({fullname})
        .then((user=>{
            const balance = user[0].balance;
            if(user.length>0){
                return {
                    allHis: JSON.stringify(allHis),
                    balance
                };
            }
        }))
        .then(result=>{
            if(action == 'accept'){
                const balance =  result.balance*1-transactionAmount*1;
                if(balance<0 && balance != 'NaN'){
                    res.json({code:1,msg:'The balance of this account is not enough'})
                }else{
                    accountModel.findOneAndUpdate({fullname},{
                        $set: {balance,[typeHis]:result.allHis}
                    })
                    .then(()=>{
                        res.json({code:0})
                    })
                }
            }else{
                accountModel.findOneAndUpdate({fullname},{
                    $set: {[typeHis]:result.allHis}
                })
                .then(()=>{
                    res.json({code:0})
                })
            }
        })
    })
})


module.exports = router;