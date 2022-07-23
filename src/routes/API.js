const express = require('express');
const router = express.Router();

const mongoose = require('mongoose');
const accountModel = require('../../models/account');

router.post('/API',(req,res)=>{

    const fullname = req.body.fullname;

    accountModel.find({fullname})
    .then((data)=>{
        res.json(data)
    })
    .catch((error)=>{res.json(error)})
});


router.post('/API/updateIDCard',(req,res)=>{
    const fullname = req.body.fullname;
    const frontIdCard = req.body.frontIdCard;
    const backIdCard = req.body.backIdCard;
    accountModel.findOneAndUpdate({fullname}, 
        {$set: {frontIdCard,backIdCard,status: "Waiting for verification"}})
        .then((data)=>{
            res.json("Update successs!!");
        })
        .catch((error)=>{res.json(error)})
});

module.exports = router;