const express = require('express');
const calllogController=require('../controller/colllog.controller')
const app = express();
const { verifyToken } = require('../middleware/verifyToken');

const router = express.Router();

router.get('/callLogAdd',calllogController.callLog_Add)
router.post('/callLogDelete/:id',calllogController.callLog_Delete)
router.post('/callLogUpdate/:id',calllogController.callLog_Updated)

module.exports=router;