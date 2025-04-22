const express = require('express');
const router = express.Router();
const { login } = require('../controller/loginController');  


router.post('/login', login);//common login for all

module.exports = router;