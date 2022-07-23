const express = require('express');
const router = express.Router();
const controller = require('../../controllers/controller');

router.get('/firstLogin',controller.getFirstLogin);
router.post('/firstLogin',controller.postFirstLogin);

module.exports = router;