const express = require('express');
const authController = require('../controller/auth.controller');
const app = express();

const router = express.Router();
app.use("/profile", express.static("uploads"));

router.get('/health-check',(req,res) => {
	res.json({
	status:true
	})
})
router.post('/register',authController.userRegistration)
router.post('/resetPass',authController.resetPassword)
router.post('/login',authController.userLogin)


module.exports = router;
