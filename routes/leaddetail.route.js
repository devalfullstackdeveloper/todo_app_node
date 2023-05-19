const express = require('express');
const clientController = require('../controller/client.controller');
const {leaddetail,notes, followup,attachments}=require('../controller/leaddetail.controller')
const router = express.Router();

router.post('/get_lead/:id', leaddetail);
router.post('/notes/:id',notes)
router.post('/followup/:id',followup)
router.post('/attachments/:id',attachments)


module.exports = router;