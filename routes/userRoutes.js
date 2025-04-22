const express= require("express");
const Router = express.Router();
const UserControllers = require("../controller/userController");
const auth = require("../middleware/auth");

 
Router.post("/register" ,UserControllers.register);
Router.get('/confirm-delivery/:orderId', auth(['user']),UserControllers.confirmDelivery);


module.exports=Router;