const express = require('express');
const router = express.Router();

const { addDeliveryAgent } = require('../controller/deliveryAgentController');

router.post('/apply', addDeliveryAgent);

module.exports = router;
