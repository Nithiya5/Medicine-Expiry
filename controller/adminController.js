const jwt = require('jsonwebtoken');

 
const adminLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (email !== process.env.DEFAULT_ADMIN_EMAIL || password !== process.env.DEFAULT_ADMIN_PASSWORD) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { email },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      adminEmail: email,
    });

  } catch (error) {
    console.error("Admin login error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


const Medicine = require('../models/medicineModel');

// 1. Get all medicines pending approval
const getPendingMedicines = async (req, res) => {
  try {
    const pendingMedicines = await Medicine.find({ status: 'Pending' });
    res.status(200).json(pendingMedicines);
  } catch (error) {
    console.error('Error fetching pending medicines:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// 2. Approve and set price
const approveMedicine = async (req, res) => {
  try {
    const { id } = req.params;
    const { price } = req.body;

    if (!price || price <= 0) {
      return res.status(400).json({ error: 'Price must be greater than 0' });
    }

    const medicine = await Medicine.findByIdAndUpdate(
      id,
      { price, status: 'Approved' },
      { new: true, runValidators: true }
    );

    if (!medicine) {
      return res.status(404).json({ error: 'Medicine not found' });
    }

    res.status(200).json({ message: 'Medicine approved', medicine });
  } catch (error) {
    console.error('Error approving medicine:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// 3. Reject medicine (delete from DB)
const rejectMedicine = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedMedicine = await Medicine.findByIdAndDelete(id);

    if (!deletedMedicine) {
      return res.status(404).json({ error: 'Medicine not found' });
    }

    res.status(200).json({ message: 'Medicine rejected and deleted' });
  } catch (error) {
    console.error('Error rejecting medicine:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getApprovedMedicines = async (req, res) => {
  try {
    const approvedMedicines = await Medicine.find({ status: 'Approved' });
    res.status(200).json(approvedMedicines);
  } catch (error) {
    console.error('Error fetching approved medicines:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getPendingMedicines,
  approveMedicine,
  rejectMedicine,
  getApprovedMedicines,
  adminLogin
};

