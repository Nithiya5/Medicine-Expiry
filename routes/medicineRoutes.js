const express = require('express');
const { addMedicine,getAllMedicine,  getOneMedicine, updateMedicine, deleteById } = require('../controller/medicineController');
const auth = require('../middleware/auth');

const router = express.Router();


router.post('/add',auth, addMedicine);

router.get('/getAll',auth, getAllMedicine);

router.get('/getOne/:id',auth, getOneMedicine);

router.put('/update/:id', auth,updateMedicine);

router.delete('/delete/:id',auth, deleteById);

module.exports = router;
