const express = require('express');
const {getApprovedMedicines,getPendingMedicines,rejectMedicine,approveMedicine,getAllOrders,getApprovedOrders,getPendingOrders,assignDeliveryAgent,viewDeliveryAgentApplications,approveDeliveryAgentApplication,rejectDeliveryAgentApplication } = require('../controller/adminController');
const auth = require('../middleware/auth');


const router = express.Router();

router.get('/medicines/pending',auth(['admin']), getPendingMedicines);
router.put('/medicines/approve/:id',auth(['admin']), approveMedicine);
router.delete('/medicines/reject/:id',auth(['admin']), rejectMedicine);
router.get('/medicines/approved',auth(['admin']), getApprovedMedicines);
router.get('/orders/approved',auth(['admin']), getApprovedOrders);
router.get('/orders/pending',auth(['admin']), getPendingOrders);
router.put('/orders/assign/:orderId',auth(['admin']), assignDeliveryAgent);
router.get('/orders/all',auth(['admin']), getAllOrders);
router.get('/deliveryAgent/applications',auth(['admin']), viewDeliveryAgentApplications);
router.post('/applications/:id/approve', auth(['admin']),approveDeliveryAgentApplication);
router.post('/applications/:id/reject',auth(['admin']), rejectDeliveryAgentApplication);

module.exports = router;