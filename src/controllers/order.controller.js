import Order from "../models/order.model.js";
import Cart from "../models/cart.model.js";

export const placeOrder = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }

    const { items, address, paymentMethod, totalAmount } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No order items"
      });
    }

    const order = await Order.create({
      user: req.user._id, // ✅ FIXED
      items,
      address,
      paymentMethod,
      totalAmount
    });

    await Cart.findOneAndUpdate(
      { user: req.user._id }, // ✅ FIXED
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

export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }) // ✅ FIXED
      .sort({ createdAt: -1 });

    res.json({ success: true, orders });
  } catch {
    res.status(500).json({ success: false });
  }
};
