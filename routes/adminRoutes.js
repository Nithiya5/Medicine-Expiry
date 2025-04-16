const express = require('express');
const {adminLogin,getApprovedMedicines,getPendingMedicines,rejectMedicine,approveMedicine,getAllOrders,getApprovedOrders,getPendingOrders,assignDeliveryAgent,viewDeliveryAgentApplications,approveDeliveryAgentApplication,rejectDeliveryAgentApplication } = require('../controller/adminController');
const adminAuth = require('../middleware/adminAuth');


const router = express.Router();

router.post('/login', adminLogin);
router.get('/medicines/pending',adminAuth, getPendingMedicines);
router.put('/medicines/approve/:id',adminAuth, approveMedicine);
router.delete('/medicines/reject/:id',adminAuth, rejectMedicine);
router.get('/medicines/approved',adminAuth, getApprovedMedicines);
router.get('/orders/approved',adminAuth, getApprovedOrders);
router.get('/orders/pending',adminAuth, getPendingOrders);
router.put('/orders/assign/:orderId',adminAuth, assignDeliveryAgent);
router.get('/orders/all',adminAuth, getAllOrders);
router.get('/deliveryAgent/applications',adminAuth, viewDeliveryAgentApplications);
router.post('/applications/:id/approve', adminAuth,approveDeliveryAgentApplication);
router.post('/applications/:id/reject',adminAuth, rejectDeliveryAgentApplication);

module.exports = router;