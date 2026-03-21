const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// 公开路由（商品列表）
router.get('/', productController.getProducts);

// 订单相关路由（必须在 /:id 之前定义）
router.post('/orders', authMiddleware, productController.createOrder);
router.get('/orders', authMiddleware, productController.getOrders);
router.post('/orders/:id/payment', authMiddleware, productController.confirmPayment);
router.post('/orders/:id/confirm-receive', authMiddleware, productController.confirmReceive);

// 商品详情路由（放在最后，避免匹配其他路径）
router.get('/:id', productController.getProductDetail);

// 需要认证的路由
router.post('/', authMiddleware, adminMiddleware, productController.createProduct);
router.put('/:id', authMiddleware, adminMiddleware, productController.updateProduct);
router.delete('/:id', authMiddleware, adminMiddleware, productController.deleteProduct);

module.exports = router;
