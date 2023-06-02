const express = require('express');
const dropdowncontroller = require('../controller/dropdown.controller');
const {project_status} = require('../controller/dropdown.controller')

const router = express.Router();

router.get('/get_project_status',dropdowncontroller.project_status)
router.get('/get_outcome',dropdowncontroller.outcome)
router.get('/get_priority',dropdowncontroller.priority)
router.get('/get_project_type',dropdowncontroller.project_type)

module.exports=router;