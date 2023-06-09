const express = require('express');
const authRoutes = require('./auth.route');
const leadRoutes = require('./lead.route');
const noteRoutes = require('./note.route');
const clientRoutes = require('./client.route');
const uploadRoutes = require('./upload.route');
const dashboard = require('./dashboard.route');
const leaddetail = require('./leaddetail.route');
const calllog = require('./calllog.route');
const dropdown = require('./dropdown.route');

const { verifyToken } = require('../middleware/verifyToken');

const router = express.Router();
router.use('/auth', authRoutes);
router.use('/dashboard', verifyToken, dashboard);
router.use('/leaddetail', verifyToken, leaddetail)
router.use('/lead', verifyToken, leadRoutes);
router.use('/note', verifyToken, noteRoutes);
router.use('/client', verifyToken, clientRoutes);
router.use('/upload', uploadRoutes);
router.use('/calllog', verifyToken, calllog);
router.use('/dropdown', verifyToken, dropdown)

module.exports = router;
