const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authMiddleware } = require('../middleware/auth');
const upload = require('../../middleware/upload');

// 公开路由
router.post('/register', authController.register);
router.post('/login', authController.login);

// 需要认证的路由
router.get('/me', authMiddleware, authController.getCurrentUser);
router.put('/profile', authMiddleware, authController.updateProfile);
router.post('/upload-avatar', authMiddleware, upload.single('avatar'), authController.uploadAvatar);
router.get('/referees', authMiddleware, authController.getReferees);
router.get('/commissions', authMiddleware, authController.getCommissions);
router.get('/referral-stats', authMiddleware, authController.getReferralStats);
router.get('/referee/:userId/order-stats', authMiddleware, authController.getRefereeOrderStats);

module.exports = router;
