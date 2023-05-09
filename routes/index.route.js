const express = require('express');
const authRoutes = require('./auth.route');
const leadRoutes = require('./lead.route');
const noteRoutes = require('./note.route');
const clientRoutes = require('./client.route');

const { verifyToken } = require('../middleware/verifyToken');

const router = express.Router();
router.use('/auth', authRoutes);
router.use('/lead', leadRoutes);
router.use('/note', noteRoutes);
router.use('/client', clientRoutes);

module.exports = router;
