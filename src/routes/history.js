const express = require('express');
const router = express.Router();
const controller = require('../../controllers/controller');
const mongoose = require('mongoose');
const accountModel = require('../../models/account');
const creditCard = require('../../models/creditCard');

router.post('/history',(req,res)=>{
    if(req.body.username){
        const account = {
            username: req.body.username,
            password: req.body.password
        }
        req.session.account = account;
        let th = '';
        let H = '';
        if(req.body.typeHis == 'allHis'){
            th = 'Transaction history';
        }else if(req.body.typeHis == 'loading'){
            th = 'Transaction loading money history';
            H = 'historyRecharge';
        }else if(req.body.typeHis == 'transfer'){
            th = 'Transaction transfer history';
            H = 'historyTransfer';
        }else if(req.body.typeHis == 'withdraw'){
            th = 'Transaction withdraw history';
            H = 'historyWithdraw';
        }else if(req.body.typeHis == 'payment'){
            th = 'Transaction payment history';
            H = 'historyBuyCard';
        }
    
        accountModel.find({username:account.username})
        .then((user)=>{
            if(user.length > 0){
                if(H == ''){
                    const loading = JSON.parse(user[0]['historyRecharge'] != '' ? user[0]['historyRecharge'] : '[]');
                    const transfer = JSON.parse(user[0]['historyTransfer'] != '' ? user[0]['historyTransfer'] : '[]');
                    const withdraw = JSON.parse(user[0]['historyWithdraw'] != '' ? user[0]['historyWithdraw'] : '[]');
                    const payment = JSON.parse(user[0]['historyBuyCard'] != '' ? user[0]['historyBuyCard'] : '[]');

                    const allHis = [...loading,...transfer,...withdraw,...payment];

                    const allHisSort = allHis.sort((a,b) =>{
                        let string1 = b.date;
                        let string2 = a.date;
                        let a1 = new Date(string2.split('/')[2],string2.split('/')[1],string2.split('/')[0]); 
                        let b1 = new Date(string1.split('/')[2],string1.split('/')[1],string1.split('/')[0]);
                        return b1 - a1;
                    })

                    allHisSort.forEach(item=>{
                        if(item.transactionFee != '0 đ'){
                            item.amountInText = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.transactionFee*1);
                        }else{
                            item.amountInText = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(0)
                        }
                    })
                    
                    res.render('history',{th,his:allHisSort});
                }else{
                    if(user[0][H] != ''){
                        const his = JSON.parse(user[0][H]);

                        const hisSort = his.sort((a,b) =>{
                            let string1 = b.date;
                            let string2 = a.date;
                            let a1 = new Date(string2.split('/')[2],string2.split('/')[1],string2.split('/')[0]); 
                            let b1 = new Date(string1.split('/')[2],string1.split('/')[1],string1.split('/')[0]);
                            return b1 - a1;
                        })

                        res.render('history',{th,his:hisSort});
                    }else{
                        res.render('history',{th,his:[]});
                    }
                }
            }
        })
    }else{
        req.session.destroy();
        res.redirect('/login');
    }
    
});

module.exports = router;