import Order from "../models/order.model.js";
import Cart from "../models/cart.model.js";

/* ==============================
   PLACE ORDER (FIXED)
============================== */
export const placeOrder = async (req, res) => {
  try {
    // 🔐 safety guard
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }

    const userId = req.user._id;

    const { address, paymentMethod } = req.body;

    const cart = await Cart.findOne({ user: userId })
      .populate("items.product");

    if (!cart || !cart.items || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Cart is empty"
      });
    }

    // ✅ sanitize cart items
    const items = cart.items
      .filter(item => item.product && item.quantity > 0)
      .map(item => ({
        product: item.product._id,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity
      }));

    if (items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid cart items"
      });
    }

    const totalAmount = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const order = await Order.create({
      user: userId,          // ✅ FIXED
      items,
      totalAmount,
      address,               // ✅ ADDED
      paymentMethod          // ✅ ADDED
    });

    // ✅ clear cart after successful order
    cart.items = [];
    await cart.save();

    return res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order
    });
  } catch (error) {
    console.error("PLACE ORDER ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to place order"
    });
  }
};

/* ==============================
   GET USER ORDERS (FIXED)
============================== */
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }) // ✅ FIXED
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (error) {
    console.error("GET MY ORDERS ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch orders"
    });
  }
};

/* ==============================
   ADMIN: GET ALL ORDERS
============================== */
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (error) {
    console.error("GET ALL ORDERS ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch all orders"
    });
  }
};
