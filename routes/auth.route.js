const express = require('express');
const authController = require('../controller/auth.controller');
const app = express();
const { verifyToken } = require('../middleware/verifyToken');

const router = express.Router();
app.use("/profile", express.static("uploads"));

router.get('/health-check', (req, res) => {
	res.json({
		status: true
	})
})
router.post('/register', authController.userRegistration);
router.post('/resetPass', authController.resetPassword);
router.post('/login', authController.userLogin);
router.post('/logout/:id', authController.userlogout);
router.post('/edit_user/:id', verifyToken, authController.editUser);
router.get('/user_list', verifyToken, authController.userList);
router.post('/delete_user/:id', verifyToken, authController.deleteUser);
router.post('/send-otp', authController.sendOtp);
router.post('/match-otp', authController.MatchOtp);
module.exports = router;
