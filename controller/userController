const User = require("../models/userModel");
const bcrypt=require("bcryptjs");
const jwt= require("jsonwebtoken")

const register = async (req, res) => {
    try {
        const {
            userName,
            email,
            password,
           
        } = req.body;

       
        if (!userName || !email || !password) {
            return res.status(400).send("Please enter all required fields");
        }

        
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).send("User already exists");
        }

        const newUser = new User({
                userName,
                email,
                password, 
             
        });

       
        await newUser.save();
        res.status(201).json({ user: newUser });
    } catch (err) {
        console.error(err); 
        res.status(400).send("An error occurred");
    }
};


const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        
        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            return res.status(400).json({ message: 'Invalid password' });
        }

        const token = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET || 'secret_key',
            { expiresIn: '1h' }
        );

        res.status(200).json({
            token,
            role: user.role
        });
    } catch (err) {
        console.error(err);
        res.status(400).json({ message: 'An error occurred' });
    }
};


module.exports={register , login};