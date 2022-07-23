const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const accountModel = require('../../models/account');
const creditCard = require('../../models/creditCard');

router.get('/buyCard',(req, res) => {
    const typeCard = req.session.typeCard;
    const user = req.session.account;

    if(req.session.account){
        res.render('buyCard',{typeCard,user})
    }else{
        req.session.destroy();
        res.redirect('/login');
    }
})

router.post('/buyCard',(req,res) => {
    req.session.account = {username:req.body.username,password:req.body.password};
    req.session.typeCard = req.body.type;
    if(req.body.type){
        res.json({code:0})
    }
});

router.post('/checkBalence',(req, res)=>{
    const charge = req.body.charge;
    const username = req.body.username;
    const password = req.body.password;
    const IDCards = req.body.IDCards;

    accountModel.find({username})
    .then((user)=>{
        if(user.length>0){
            if(user[0].balance*1 >= charge*1){
                accountModel.find({username})
                .then((user)=>{
                    if(user.length>0){
                        let historyBuyCard = [];
                        const ID = `BC${Math.floor(Math.random()*20000)}`;
                        const transactionOwner = user[0].fullName;
                        const currentDate = new Date();

                        const buyCardInfor = {
                            ID,
                            transactionOwner,
                            transactionFee: "0 đ",
                            message: `Successful card purchase with fee total: ${charge}; includes card codes: ${IDCards.join(' ; ')}`,
                            note:'',
                            status:'Success',
                            date: `${currentDate.getDate()}/${currentDate.getMonth()+1}/${currentDate.getFullYear()}`,
                            transactionAmount: charge
                        }

                        if(user[0].historyBuyCard == ''){
                            historyBuyCard = [buyCardInfor];
                        }else{
                            const oldHis = JSON.parse(user[0].historyBuyCard);
                            historyBuyCard = [buyCardInfor,...oldHis];
                        }
                        historyBuyCard = JSON.stringify(historyBuyCard);
                        accountModel.findOneAndUpdate({username}, 
                            {$set: {balance:user[0].balance*1-charge,historyBuyCard}})
                            .then(()=>{
                                res.json({code:0,msg:''});
                            })
                    }
                })
                .catch(e=>console.log(e))
            }else{
                res.json({code:1,msg:'The balance is not enough'})
            }
        }
    })
})

module.exports = router;