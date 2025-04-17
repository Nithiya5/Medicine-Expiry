const express= require("express");
const Router = express.Router();
const UserControllers = require("../controller/userController");
const auth = require("../middleware/auth");

 
Router.post("/register" ,UserControllers.register);

module.exports=Router;