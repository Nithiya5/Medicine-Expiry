const express = require('express');
const { addMedicine,  getOneMedicine, updateMedicine, deleteById, getMedicinesByUser,getMedicineByCategory,removeFromCart,addToCart,getCart } = require('../controller/medicineController');
const auth = require('../middleware/auth');
const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ storage }).single('file');

const router = express.Router();



// ✅ Add a new medicine donation/sale listing by a user
router.post('/add/:userId', auth(['user']), addMedicine);


// ✅ Get details of a specific medicine by its ID(DONOR)
router.get('/getOne/:id', auth(['user', 'admin']), getOneMedicine);

// ✅ Get all medicines listed by a specific user (donor view)
router.get('/donorMedicine/:userId', auth(['user']), getMedicinesByUser);

// ✅ Filter and get medicines based on their category
router.get('/categoryMedicine', auth(['user', 'admin']), getMedicineByCategory);

// ✅ Update details of a medicine listed by the user (including image if provided) By Donor
router.put('/update/:id', auth(['user']), upload, updateMedicine);

// ✅ Delete a specific medicine listed by the user (By Donor)
router.delete('/delete/:id', auth(['user']), deleteById);

// ✅ Remove a specific medicine from the user's cart(By Buyer)
router.delete('/removeFromCart/:id', auth(['user']), removeFromCart);

// ✅ Add or update a medicine in the user's cart with selected quantity
router.put('/addToCart', auth(['user']), addToCart);

router.get('/cart', auth(['user']), getCart);



module.exports = router;
