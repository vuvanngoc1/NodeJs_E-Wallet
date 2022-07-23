const express = require('express');
const router = express.Router();
const controller = require('../../controllers/controller');

router.get('/',controller.getHome);
router.post('/',(req,res)=>{
    if(req.body.logOut == 'true'){
        req.session.destroy();
        res.redirect('/login');
    }
});

module.exports = router;