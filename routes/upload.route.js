const express = require('express');
const uploadController = require('../controller/upload.controller');
const router = express.Router();

router.post('/add_attachments', uploadController.checkDir, uploadController.uploadDocument, uploadController.addDocument);
router.get('/get_attachments', uploadController.getDocument);
router.post('/delete_attachments/:id', uploadController.deleteDocument);
router.post("/upload", uploadController.checkDirPro, uploadController.upload, uploadController.uploadFile);

module.exports = router;