const express = require('express');
const noteController = require('../controller/note.controller');


const router = express.Router();



router.post('/showNotes/:client_id',noteController.showNotes)

//Note Add,Edit,Delete
router.post('/noteAdd',noteController.noteAdd)
router.post('/noteEdit/:id',noteController.noteEdit)
router.post('/noteDelete/:id',noteController.noteDelete)

module.exports = router;

