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
    const { userId, selectedCartItemIds, name, phoneNo, email, address } = req.body;

    if (!selectedCartItemIds || selectedCartItemIds.length === 0) {
      return res.status(400).json({ message: 'No cart items selected for ordering' });
    }

    const items = await Promise.all(selectedCartItemIds.map(async (cartItem) => {
      const cartDoc = await Cart.findOne({ _id: cartItem._id, userId });

      if (!cartDoc) {
        throw new Error(`Cart item not found for ID: ${cartItem._id}`);
      }

      const medicine = await Medicine.findById(cartDoc.medicineId);

      if (!medicine) {
        throw new Error(`Medicine not found for ID: ${cartDoc.medicineId}`);
      }

      const requestedQuantity = cartItem.quantity;

      if (requestedQuantity > medicine.quantity) {
        throw new Error(`Not enough stock for ${medicine.name}. Available: ${medicine.quantity}`);
      }

      return {
        medicineId: medicine._id,
        medicineName: medicine.name,
        quantity: requestedQuantity,
        price: medicine.price * requestedQuantity
      };
    }));

    const grandTotal = items.reduce((total, item) => total + item.price, 0);

    const order = new Order({
      userId,
      items,
      name,
      phoneNo,
      email,
      address,
      status: 'Pending',
      grandTotal
    });

    await order.save();

    // Decrement stock
    for (const item of items) {
      await Medicine.findByIdAndUpdate(item.medicineId, {
        $inc: { quantity: -item.quantity }
      });
    }

    // Remove cart items
    await Cart.deleteMany({ _id: { $in: selectedCartItemIds.map(item => item._id) } });

    res.status(201).json({ message: 'Selected items ordered successfully', order });

  } catch (error) {
    console.error('Error placing order:', error.message);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

const getOrderHistory = async (req, res) => {
  try {
    const { userId } = req.params; // Get the userId from the request params

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required to fetch orders' });
    }

    // Fetch orders where the userId matches and the status is "Delivered"
    const pastOrders = await Order.find({
      userId,
      status: 'Delivered'
    }).populate('items.medicineId', 'name price') // Optionally populate the medicine details (name and price)
      .sort({ createdAt: -1 }); // Sort by most recent orders first

    if (pastOrders.length === 0) {
      return res.status(404).json({ message: 'No past orders found for this user' });
    }

    // Return the past orders to the user
    res.status(200).json({ message: 'Past orders retrieved successfully', pastOrders });
  } catch (error) {
    console.error('Error retrieving past orders:', error.message);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};


module.exports = { placeOrder,getOrderHistory};
