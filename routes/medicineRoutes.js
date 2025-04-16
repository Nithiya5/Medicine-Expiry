const express = require('express');
const { addMedicine,getAllMedicine,  getOneMedicine, updateMedicine, deleteById, getMedicinesByUser,getMedicineByCategory,removeFromCart,addToCart,getP } = require('../controller/medicineController');
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

router.delete('/delete/:id',auth, deleteById);

router.delete('/removeFromCart/:id',auth,removeFromCart);

router.put('/addToCart',auth,addToCart);


module.exports = router;
