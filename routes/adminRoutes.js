const express = require('express');
const {registerAdmin,getApprovedMedicines,getPendingMedicines,rejectMedicine,approveMedicine,getAllOrders,getApprovedOrders,getPendingOrders,assignDeliveryAgent,viewDeliveryAgentApplications,approveDeliveryAgentApplication,rejectDeliveryAgentApplication,editMedicine,deleteMedicine,getAvailableDeliveryAgents } = require('../controller/adminController');
const auth = require('../middleware/auth');

const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ storage }).single('file');


const router = express.Router();
// ✅ Register a new admin
router.post('/register', registerAdmin);

// ✅ Get a list of medicines that are awaiting admin approval
router.get('/medicines/pending', auth(['admin']), getPendingMedicines);

// ✅ Approve a specific medicine (sets status to 'Approved')
router.put('/medicines/approve/:id', auth(['admin']), approveMedicine);

// ✅ Reject a specific medicine (removes or marks it as rejected)
router.delete('/medicines/reject/:id', auth(['admin']), rejectMedicine);

// ✅ Get all medicines that have been approved
router.get('/medicines/approved', auth(['admin']), getApprovedMedicines);

// ✅ Get all orders that have already been approved
router.get('/orders/approved', auth(['admin']), getApprovedOrders);

// ✅ Get orders that are still pending approval or assignment
router.get('/orders/pending', auth(['admin']), getPendingOrders);

// ✅ Assign a delivery agent to a specific order
router.put('/orders/assign/:orderId', auth(['admin']), assignDeliveryAgent);

// ✅ Get a list of all orders (pending, approved, delivered, etc.)
router.get('/orders/all', auth(['admin']), getAllOrders);

// ✅ View applications submitted by potential delivery agents
router.get('/deliveryAgent/applications', auth(['admin']), viewDeliveryAgentApplications);

// ✅ Approve a specific delivery agent's application
router.post('/applications/:id/approve', auth(['admin']), approveDeliveryAgentApplication);

// ✅ Reject a specific delivery agent's application
router.post('/applications/:id/reject', auth(['admin']), rejectDeliveryAgentApplication);

// ✅ Edit an existing medicine (including optional image upload)
router.put('/medicine/:id', auth(['admin']), upload, editMedicine);

// ✅ Delete a specific medicine from the database
router.delete('/medicine/:id', auth(['admin']), deleteMedicine);

// ✅ Get a list of available delivery agents for a given order
router.get('/available-agents/:orderId', auth(['admin']), getAvailableDeliveryAgents);

module.exports = router;