const express = require('express');
const leadController = require('../controller/lead.controller');


const router = express.Router();



router.post('/showLeads',leadController.showlead)
//lead Add,Edit,Delete

router.post('/leadAdd',leadController.leadAdd)
router.post('/leadEdit/:id',leadController.leadEdit)
router.get('/leadDelete/:id',leadController.leadDelete)

router.get('/favourite/:id',leadController.favouriteButton)

module.exports = router;

