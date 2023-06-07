const express = require('express');
const leadController = require('../controller/lead.controller');
const { route } = require('./auth.route');

const router = express.Router();

router.post('/showLeads', leadController.showlead);
router.get('/leadsource', leadController.leadsource)

//lead Add,Edit,Delete
router.post('/leadAdd', leadController.leadAdd);
router.post('/leadEdit/:id', leadController.leadEdit);
router.get('/leadDelete/:id', leadController.leadDelete);
router.get('/favourite/:id', leadController.favouriteButton);
router.post('/add_followup', leadController.addFollowUp);
router.get('/followUpList/:type', leadController.followUpList);
router.get('/followUpListBy_lead', leadController.followUpListBy_lead);
router.post('/followUpList_Datewise', leadController.followUpList_Datewise);
router.get('/lead_created_homePage', leadController.lead_created_homePage);
router.get('/lead_converted', leadController.lead_converted);
router.get('/activityHistory', leadController.activityHistory);
router.get('/lead_project', leadController.lead_project);
router.post('/update_followup/:id', leadController.updateFollowUp);
router.get('/priority_list/:event', leadController.priorityList);
router.get('/industries_list/:event', leadController.industriesList);
router.get('/status_list/:event', leadController.statusList);
router.post('/delete_followup/:id', leadController.deletefollowup);

module.exports = router;

