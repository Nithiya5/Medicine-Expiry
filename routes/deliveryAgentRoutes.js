const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

const { addDeliveryAgent,acceptOrder,rejectOrder,confirmDelivery } = require('../controller/deliveryAgentController');


// ✅ Register a new delivery agent(Apply for job)
router.post('/apply' ,addDeliveryAgent);

// Agent accepts an assigned order
router.post('/orders/accept', auth(['deliveryAgent']),acceptOrder);

// Agent rejects an assigned order
router.post('/orders/reject', auth(['deliveryAgent']),rejectOrder);

// Agent confirms delivery of an order
router.post('/orders/confirm-delivery', auth(['deliveryAgent']),confirmDelivery);


module.exports = router;
