const express = require('express');
const {adminLogin,getApprovedMedicines,getPendingMedicines,rejectMedicine,approveMedicine } = require('../controller/adminController');
const auth = require('../middleware/auth');


const router = express.Router();

router.post('/login', adminLogin);
router.get('/medicines/pending',auth, getPendingMedicines);
router.put('/medicines/approve/:id',auth, approveMedicine);
router.delete('/medicines/reject/:id',auth, rejectMedicine);
router.get('/medicines/approved',auth, getApprovedMedicines);

module.exports = router;