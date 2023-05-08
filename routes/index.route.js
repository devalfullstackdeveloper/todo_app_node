const express = require('express');
const authRoutes = require('./auth.route');
const leadRoutes = require('./lead.route');
const noteRoutes = require('./note.route');


const { verifyToken } = require('../middleware/verifyToken');


const router = express.Router();
router.use('/auth', authRoutes);
router.use('/lead', leadRoutes);
router.use('/note', noteRoutes);

module.exports = router;
