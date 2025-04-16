const express = require('express');
const { addMedicine,getAllMedicine,  getOneMedicine, updateMedicine, deleteById, getMedicinesByUser,getMedicineByCategory } = require('../controller/medicineController');
const auth = require('../middleware/auth');
const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ storage }).single('file');

const router = express.Router();


router.post('/add/:userId',auth, addMedicine);

router.get('/getAll',auth, getAllMedicine);

router.get('/getOne/:id',auth, getOneMedicine);

router.get('/donorMedicine/:userId', auth, getMedicinesByUser); 

router.get('/categoryMedicine',auth,getMedicineByCategory); 

router.put('/update/:id', auth,upload,updateMedicine);
// router.put('/update/:id', upload.single('file'), updateMedicine);

router.delete('/delete/:id',auth, deleteById);

module.exports = router;
