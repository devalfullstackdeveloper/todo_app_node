const express = require('express');
const noteController = require('../controller/note.controller');


const router = express.Router();



router.get('/showNotes/:client_id',noteController.showNotes)

//Note Add,Edit,Delete
router.post('/noteAdd',noteController.noteAdd)
router.post('/noteEdit/:id',noteController.noteEdit)
router.get('/noteDelete/:id',noteController.noteDelete)

module.exports = router;

