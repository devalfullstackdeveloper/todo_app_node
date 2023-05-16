const express = require('express');
const authRoutes = require('./auth.route');
const leadRoutes = require('./lead.route');
const noteRoutes = require('./note.route');
const clientRoutes = require('./client.route');
const uploadRoutes = require('./upload.route');
const dashboard = require('./dashboard.route');

const { verifyToken } = require('../middleware/verifyToken');

const router = express.Router();
router.use('/auth', authRoutes);
router.use('/dashboard',dashboard)
router.use('/lead', leadRoutes);
router.use('/note', noteRoutes);
router.use('/client', clientRoutes);
router.use('/upload', uploadRoutes);

module.exports = router;
