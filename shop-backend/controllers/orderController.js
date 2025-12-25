const asyncHandler = require('express-async-handler');
const Order = require('../models/Order');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const addOrderItems = asyncHandler(async (req, res) => {
    const {
        orderItems,
        shippingAddress,
        paymentMethod,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
    } = req.body;

    if (orderItems && orderItems.length === 0) {
        res.status(400);
        throw new Error('No order items');
        return;
    } else {
        const orderId = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;

        const order = new Order({
            orderId,
            orderItems,
            user: req.user._id,
            shippingAddress,
            paymentMethod,
            itemsPrice,
            taxPrice,
            shippingPrice,
            totalPrice,
        });

        const createdOrder = await order.save();

        const io = req.app.get('socketio');
        io.emit('order_created', createdOrder);
        io.emit('order_updated', createdOrder);

        res.status(201).json(createdOrder);
    }
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id).populate(
        'user',
        'name email'
    );

    if (order) {
        res.json(order);
    } else {
        res.status(404);
        throw new Error('Order not found');
    }
});

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = asyncHandler(async (req, res) => {
    const orders = await Order.find({}).populate('user', 'id name');
    res.json(orders);
});

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = asyncHandler(async (req, res) => {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
});

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (order) {
        order.orderStatus = req.body.orderStatus || order.orderStatus;

        if (req.body.orderStatus === 'Delivered') {
            order.isDelivered = true;
            order.deliveredAt = Date.now();
        }

        const updatedOrder = await order.save();

        const io = req.app.get('socketio');
        io.emit('order_updated', updatedOrder);

        res.json(updatedOrder);
    } else {
        res.status(404);
        throw new Error('Order not found');
    }
});

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
const cancelOrder = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (order) {
        if (order.user.toString() !== req.user._id.toString()) {
            res.status(401);
            throw new Error('Not authorized to cancel this order');
        }

        if (order.orderStatus === 'Shipped' || order.orderStatus === 'Delivered') {
            res.status(400);
            throw new Error('Cannot cancel order that has been shipped or delivered');
        }

        order.orderStatus = 'Cancelled';
        const updatedOrder = await order.save();

        const io = req.app.get('socketio');
        io.emit('order_updated', updatedOrder);

        res.json(updatedOrder);
    } else {
        res.status(404);
        throw new Error('Order not found');
    }
});

// @desc    Return order
// @route   PUT /api/orders/:id/return
// @access  Private
const returnOrder = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (order) {
        if (order.user.toString() !== req.user._id.toString()) {
            res.status(401);
            throw new Error('Not authorized to return this order');
        }

        if (order.orderStatus !== 'Delivered') {
            res.status(400);
            throw new Error('Can only return delivered orders');
        }

        order.orderStatus = 'Returned';
        const updatedOrder = await order.save();

        const io = req.app.get('socketio');
        io.emit('order_updated', updatedOrder);

        res.json(updatedOrder);
    } else {
        res.status(404);
        throw new Error('Order not found');
    }
});

// @desc    Get orders by user ID
// @route   GET /api/orders/user/:id
// @access  Private/Admin
const getOrdersByUserId = asyncHandler(async (req, res) => {
    const orders = await Order.find({ user: req.params.id }).sort({ createdAt: -1 });
    res.json(orders);
});

module.exports = {
    addOrderItems,
    getOrderById,
    getOrders,
    getMyOrders,
    getOrdersByUserId,
    updateOrderStatus,
    cancelOrder,
    returnOrder,
};
