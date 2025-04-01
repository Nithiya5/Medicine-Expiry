const express = require('express');
const { addOrder, deleteOrder } = require('../controller/orderController');
const auth = require('../middleware/auth'); 

const router = express.Router();

router.post('/add/:medicineId',auth, addOrder);

router.delete('/delete/:id', auth,deleteOrder);

module.exports = router;
