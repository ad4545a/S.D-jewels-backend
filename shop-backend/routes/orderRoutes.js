const express = require('express');
const router = express.Router();
const {
    addOrderItems,
    getOrderById,
    getOrders,
    getMyOrders,
    getOrdersByUserId,
    updateOrderStatus,
    cancelOrder,
    returnOrder
} = require('../controllers/orderController');
const { protect, admin } = require('../middleware/authMiddleware');
// Removed strict validation - was causing API crashes

router.route('/').post(protect, addOrderItems).get(protect, admin, getOrders);
router.route('/myorders').get(protect, getMyOrders);
router.route('/user/:id').get(protect, admin, getOrdersByUserId);
router.route('/:id').get(protect, getOrderById);
router.route('/:id/status').put(protect, admin, updateOrderStatus);
router.route('/:id/cancel').put(protect, cancelOrder);
router.route('/:id/return').put(protect, returnOrder);

module.exports = router;


