const express = require('express');
const router = express.Router();

const { addDeliveryAgent,acceptOrder,rejectOrder,confirmDelivery } = require('../controller/deliveryAgentController');

router.post('/apply', addDeliveryAgent);

// Agent accepts an assigned order
router.post('/orders/accept', acceptOrder);

// Agent rejects an assigned order
router.post('/orders/reject', rejectOrder);

// Agent confirms delivery of an order
router.post('/orders/confirm-delivery', confirmDelivery);


module.exports = router;
