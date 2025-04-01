const express = require('express');
const Order = require('../models/orderModel');
const Medicine = require('../models/medicineModel');
const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendOrderConfirmationEmail = async (email, name, medicineName, quantity) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Order Confirmation',
      html: `
        <h3>Hello ${name},</h3>
        <p>Your order for <strong>${quantity}</strong> unit(s) of <strong>${medicineName}</strong> has been successfully placed.</p>
        <p>Thank you for using our service!</p>
      `,
    });
    console.log(`Order confirmation email sent to ${email}`);
  } catch (error) {
    console.error('Error sending order confirmation email:', error);
  }
};

const sendOrderDeletionEmail = async (email, name, medicineName, quantity) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Order Cancellation',
      html: `
        <h3>Hello ${name},</h3>
        <p>Your order for <strong>${quantity}</strong> unit(s) of <strong>${medicineName}</strong> has been cancelled.</p>
        <p>If this was a mistake, please place a new order.</p>
        <p>Thank you!</p>
      `,
    });
    console.log(`Order cancellation email sent to ${email}`);
  } catch (error) {
    console.error('Error sending order cancellation email:', error);
  }
};

const addOrder = async (req, res) => {
  try {
    const { name, quantity, phoneNo, address, email } = req.body;
    const { medicineId } = req.params; 

    const medicine = await Medicine.findById(medicineId);
    if (!medicine) {
      return res.status(404).json({ message: 'Medicine not found' });
    }

    const newOrder = new Order({
      medicineId,
      medicineName: medicine.name,
      quantity,
      name,
      phoneNo,
      email,
      address,
    });

    await newOrder.save();
    sendOrderConfirmationEmail(email, name, medicine.name, quantity);
    res.status(201).json(newOrder);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    sendOrderDeletionEmail(order.email, order.name, order.medicineName, order.quantity);
    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { addOrder, deleteOrder };
