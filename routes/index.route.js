const express = require('express');
const authRoutes = require('./auth.route');

const { verifyToken } = require('../middleware/verifyToken');


const router = express.Router();
router.use('/auth', authRoutes);


module.exports = router;
