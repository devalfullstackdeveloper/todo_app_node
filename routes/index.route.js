const express = require('express');
const authRoutes = require('./auth.route');
const leadRoutes = require('./lead.route');


const { verifyToken } = require('../middleware/verifyToken');


const router = express.Router();
router.use('/auth', authRoutes);
router.use('/lead', leadRoutes);

module.exports = router;
