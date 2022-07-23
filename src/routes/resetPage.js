const express = require('express');
const router = express.Router();

router.post('/resetPageHome',(req,res)=>{
    req.session.account = req.body;
    res.redirect('/#about');
});

router.post('/resetPageBuyCard',(req,res)=>{
    const typeCard = req.session.typeCard;
    req.session.account = req.body;
    res.redirect('/buyCard');
});

module.exports = router;