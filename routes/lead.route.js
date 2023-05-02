const express = require('express');
const educationController = require('../controller/lead.controller');


const router = express.Router();



router.get('/showLeads',educationController.showlead)
//Designation Add,Edit,Delete
router.post('/leadAdd',educationController.leadAdd)
router.get('/leadDelete/:id',educationController.leadDelete)

module.exports = router;

