// const Cart = require('../models/cartModel');
// const Medicine = require('../models/medicineModel');
// const Order = require('../models/orderModel');

// const placeOrder = async (req, res) => {
//   try {
//     const { userId, name, phoneNo, email, address } = req.body;

//     const cartItems = await Cart.find({ userId });

//     if (cartItems.length === 0) {
//       return res.status(400).json({ message: 'Your cart is empty' });
//     }

//     // Validate stock availability first
//     for (const cartItem of cartItems) {
//       const medicine = await Medicine.findById(cartItem.medicineId);
//       if (!medicine) {
//         return res.status(404).json({ message: 'Medicine not found' });
//       }

//       if (cartItem.quantity > medicine.quantity) {
//         return res.status(400).json({
//           message: `Not enough stock for ${medicine.name}. Available: ${medicine.quantity}`,
//         });
//       }
//     }

//     // Create order entries
//     const orders = await Promise.all(cartItems.map(async (cartItem) => {
//       const medicine = await Medicine.findById(cartItem.medicineId);

//       return {
//         userId,
//         medicineId: cartItem.medicineId,
//         medicineName: medicine.name,
//         quantity: cartItem.quantity,
//         price: medicine.price,
//         status: 'Pending',
//         name,
//         phoneNo,
//         email,
//         address
//       };
//     }));

//     const createdOrders = await Order.insertMany(orders);

//     // Optionally decrease stock (if needed)
//     for (const order of createdOrders) {
//       await Medicine.findByIdAndUpdate(order.medicineId, {
//         $inc: { quantity: -order.quantity }
//       });
//     }

//     // Clear user's cart
//     await Cart.deleteMany({ userId });

//     res.status(201).json({ message: 'Order placed successfully', orders: createdOrders });
//   } catch (error) {
//     console.error('Error placing order:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// };

// module.exports = { placeOrder };


// const Cart = require('../models/cartModel');
// const Medicine = require('../models/medicineModel');
// const Order = require('../models/orderModel');

// const placeOrder = async (req, res) => {
//   try {
//     const { userId, name, phoneNo, email, address,quantity } = req.body;

//     const cartItems = await Cart.find({ userId });

//     if (cartItems.length === 0) {
//       return res.status(400).json({ message: 'Your cart is empty' });
//     }

//     // Validate stock availability
//     for (const cartItem of cartItems) {
//       const medicine = await Medicine.findById(cartItem.medicineId);
//       if (!medicine) {
//         return res.status(404).json({ message: 'Medicine not found' });
//       }

//       if (cartItem.quantity > medicine.quantity) {
//         return res.status(400).json({
//           message: `Not enough stock for ${medicine.name}. Available: ${medicine.quantity}`,
//         });
//       }
//     }

//     // Create order entries with calculated total price
//     const orders = await Promise.all(cartItems.map(async (cartItem) => {
//       const medicine = await Medicine.findById(cartItem.medicineId);
//       const totalPrice = medicine.price * quantity;

//       return {
//         userId,
//         medicineId: cartItem.medicineId,
//         medicineName: medicine.name,
//         quantity: quantity,
//         price: totalPrice, // total = price * quantity
//         status: 'Pending',
//         name,
//         phoneNo,
//         email,
//         address
//       };
//     }));

//     const createdOrders = await Order.insertMany(orders);

//     // Update stock quantity
//     for (const order of createdOrders) {
//       await Medicine.findByIdAndUpdate(order.medicineId, {
//         $inc: { quantity: -order.quantity }
//       });
//     }

//     // Clear cart
//     await Cart.deleteMany({ userId });

//     res.status(201).json({ message: 'Order placed successfully', orders: createdOrders });
//   } catch (error) {
//     console.error('Error placing order:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// };

// module.exports = { placeOrder };


const Cart = require('../models/cartModel');
const Medicine = require('../models/medicineModel');
const Order = require('../models/orderModel');

const placeOrder = async (req, res) => {
  try {
    const { userId, name, phoneNo, email, address } = req.body;

    const cartItems = await Cart.find({ userId });

    if (cartItems.length === 0) {
      return res.status(400).json({ message: 'Your cart is empty' });
    }

    // Validate stock and calculate prices
    const orders = await Promise.all(cartItems.map(async (cartItem) => {
      const medicine = await Medicine.findById(cartItem.medicineId);
      if (!medicine) {
        throw new Error(`Medicine not found for ID: ${cartItem.medicineId}`);
      }

      if (cartItem.quantity > medicine.quantity) {
        throw new Error(`Not enough stock for ${medicine.name}. Available: ${medicine.quantity}`);
      }

      const totalPrice = medicine.price * cartItem.quantity;

      return {
        userId,
        medicineId: cartItem.medicineId,
        medicineName: medicine.name,
        quantity: cartItem.quantity, // ✅ from cart
        price: totalPrice,           // ✅ price * quantity
        status: 'Pending',
        name,
        phoneNo,
        email,
        address
      };
    }));

    const createdOrders = await Order.insertMany(orders);

    // Update stock after order placement
    for (const order of createdOrders) {
      await Medicine.findByIdAndUpdate(order.medicineId, {
        $inc: { quantity: -order.quantity }
      });
    }

    // Clear cart after successful order
    await Cart.deleteMany({ userId });

    res.status(201).json({ message: 'Order placed successfully', orders: createdOrders });
  } catch (error) {
    console.error('Error placing order:', error.message);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

module.exports = { placeOrder };
