const express = require('express');
const clientController = require('../controller/client.controller');
const router = express.Router();

router.post('/add_client_info', clientController.addClientInfo);
router.post('/update_client_info/:id', clientController.updateClientInfo);
router.get('/get_client_list', clientController.getClientList);
router.get('/get_client_by_id/:id', clientController.getClientListById);
router.post('/add_client_project', clientController.addClientProject);
router.post('/update_client_project/:id', clientController.updateClientProject);
router.post('/delete_client_project/:id', clientController.deleteClientProject);
router.get('/project_by_id/:id', clientController.getProjectById);
router.get('/meettingBy_project',clientController.meettingBy_project);


module.exports = router;
