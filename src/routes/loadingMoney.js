const express = require('express');
const router = express.Router();
const controller = require('../../controllers/controller');

router.post('/loadingMoney',controller.postLoadingMoney);

module.exports = router;