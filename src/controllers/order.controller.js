import Order from "../models/order.model.js";
import Cart from "../models/cart.model.js";

/* ==============================
   PLACE ORDER (FIXED)
============================== */
export const placeOrder = async (req, res) => {
  try {
    // 🔐 auth check
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }

    const { items, address, paymentMethod, totalAmount } = req.body;

    // ✅ validations
    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No order items"
      });
    }

    if (!totalAmount || totalAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid total amount"
      });
    }

    // ✅ create order
    const order = await Order.create({
      user: req.user.id,
      items,
      address,
      paymentMethod,
      totalAmount
    });

    // ✅ clear cart after order
    await Cart.findOneAndUpdate(
      { user: req.user.id },
      { items: [] }
    );

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
   GET USER ORDERS
============================== */
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      orders
    });
  } catch (error) {
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
      orders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch all orders"
    });
  }
};
