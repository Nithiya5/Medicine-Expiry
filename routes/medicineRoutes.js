const express = require('express');
const { addMedicine,getAllMedicine,  getOneMedicine, updateMedicine, deleteById, getMedicinesByUser,getMedicineByCategory,removeFromCart,addToCart,getP } = require('../controller/medicineController');
const auth = require('../middleware/auth');
const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ storage }).single('file');

const router = express.Router();


router.post('/add/:userId',auth(['user']), addMedicine);

router.get('/getAll',auth(['user', 'admin']), getAllMedicine);

router.get('/getOne/:id',auth(['user', 'admin']), getOneMedicine);

router.get('/donorMedicine/:userId', auth(['user']), getMedicinesByUser); 

router.get('/categoryMedicine',auth(['user','admin']),getMedicineByCategory); 

router.put('/update/:id', auth(['user']),upload,updateMedicine);

router.delete('/delete/:id',auth(['user']), deleteById);

router.delete('/removeFromCart/:id',auth(['user']),removeFromCart);

router.put('/addToCart',auth(['user']),addToCart);


module.exports = router;
