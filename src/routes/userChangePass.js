const express = require('express');
const router = express.Router();

const mongoose = require('mongoose');
const accountModel = require('../../models/account');

router.post('/userChangePass',(req,res)=>{
    const fullname = req.body.fullname;
    accountModel.find({fullname})
    .then((data)=>{
        res.json({oldPass : data[0].password})
    })
    .catch((error)=>{res.json(error)})
});


router.put('/userChangePass',(req,res)=>{
    const fullname = req.body.fullname;
    const newPass = req.body.newPass;
    accountModel.findOneAndUpdate({fullname}, 
        {$set: {password : newPass}})
        .then((data)=>{
            res.json("Update successs!!");
        })
        .catch((error)=>{res.json(error)})
});

module.exports = router;