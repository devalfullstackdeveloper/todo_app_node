const express = require('express');
const educationController = require('../controller/lead.controller');


const router = express.Router();



router.get('/showLeads',educationController.showlead)
//lead Add,Edit,Delete

router.post('/leadAdd',educationController.leadAdd)
router.post('/leadEdit/:id',educationController.leadEdit)
router.get('/leadDelete/:id',educationController.leadDelete)

module.exports = router;

