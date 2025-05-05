const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

const { addDeliveryAgent,acceptOrder,rejectOrder,confirmDelivery,getAssignedOrders,getAcceptedOrders } = require('../controller/deliveryAgentController');


// ✅ Register a new delivery agent(Apply for job)
router.post('/apply' ,addDeliveryAgent);

// Agent accepts an assigned order
router.post('/orders/accept', auth(['deliveryAgent']),acceptOrder);

// Agent rejects an assigned order
router.post('/orders/reject', auth(['deliveryAgent']),rejectOrder);

// Agent confirms delivery of an order
router.post('/orders/confirm-delivery', auth(['deliveryAgent']),confirmDelivery);

router.get('/:deliveryAgentId/assignedOrders', auth(['deliveryAgent']), getAssignedOrders);
router.get('/accepted-orders/:agentId', auth(['deliveryAgent']), getAcceptedOrders);




module.exports = router;
