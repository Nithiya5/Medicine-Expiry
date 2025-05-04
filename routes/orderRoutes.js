const express = require('express');
const {placeOrder,getOrderHistory} = require('../controller/orderController');
const auth = require('../middleware/auth'); 

const router = express.Router();

// Route to place an order
router.post('/placeOrder', auth(['user']), placeOrder);  
// Route to get order history
router.get('/orderHistory/:userId', auth(['user']), getOrderHistory);

module.exports = router;
