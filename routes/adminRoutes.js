const express = require('express');
const {registerAdmin,getApprovedMedicines,getPendingMedicines,rejectMedicine,approveMedicine,getAllOrders,getApprovedOrders,getPendingOrders,assignDeliveryAgent,viewDeliveryAgentApplications,approveDeliveryAgentApplication,rejectDeliveryAgentApplication,editMedicine,deleteMedicine } = require('../controller/adminController');
const auth = require('../middleware/auth');

const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ storage }).single('file');


const router = express.Router();

router.post('/register', registerAdmin);
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
router.put('/medicine/:medicineId',auth(['admin']),upload, editMedicine);
router.delete('/medicine/:medicineId',auth(['admin']), deleteMedicine);

module.exports = router;