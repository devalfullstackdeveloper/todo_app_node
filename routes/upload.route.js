const express = require('express');
const uploadController = require('../controller/upload.controller');
const router = express.Router();

router.post('/add_attachments', uploadController.checkDir, uploadController.uploadDocument, uploadController.addDocument);
router.get('/get_attachments', uploadController.getDocument);
router.get('/delete_attachments/:id', uploadController.deleteDocument);

module.exports = router;