const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const upload = require('../../middleware/upload');

// 所有管理后台路由都需要管理员权限
router.use(authMiddleware, adminMiddleware);

// 数据统计
router.get('/dashboard', adminController.getDashboard);

// 用户管理
router.get('/users', adminController.getUserList);

// 分销关系
router.get('/referral-tree', adminController.getReferralTree);

// 佣金管理
router.get('/commissions', adminController.getCommissionList);
router.post('/commissions/pay', adminController.payCommissions);
router.get('/commission-payments', adminController.getPaymentRecords);

// 订单管理
router.get('/orders', adminController.getOrderList);
router.get('/orders/:id', adminController.getOrderDetail);
router.put('/orders/:id', adminController.updateOrderStatus);

// 商品管理
router.get('/products', adminController.getProductList);
router.get('/products/:id', adminController.getProductDetail);
router.post('/products', adminController.createProduct);
router.put('/products/:id', adminController.updateProduct);
router.put('/products/:id/status', adminController.toggleProductStatus);
router.delete('/products/:id', adminController.deleteProduct);

// 回收站管理
router.get('/products/recycled', adminController.getRecycledProducts);
router.post('/products/:id/restore', adminController.restoreProduct);
router.delete('/products/:id/delete-forever', adminController.deleteProductForever);
router.post('/products/batch-restore', adminController.batchRestore);
router.post('/products/batch-delete-forever', adminController.batchDeleteForever);

// 图片上传
router.post('/upload', upload.single('image'), adminController.uploadImage);

// 分销关系
router.get('/referral-tree', adminController.getReferralTree);
router.get('/users/:userId/downlines', adminController.getUserDownlines);

// 系统配置
router.put('/config', adminController.updateConfig);

module.exports = router;
