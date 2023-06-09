const express = require('express');
const clientController = require('../controller/client.controller');
const { dashboard } = require('../controller/dashboard.controller');
const router = express.Router();

router.get('/get_statistics', dashboard);


module.exports = router;