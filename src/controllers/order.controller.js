import Order from "../models/order.model.js";
import Cart from "../models/cart.model.js";

/* ==============================
   PLACE ORDER (COD + ONLINE)
============================== */
export const placeOrder = async (req, res) => {
  try {
    // 🔐 auth guard
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }

    const { address, paymentMethod, paymentId } = req.body;

    const cart = await Cart.findOne({ user: req.user.id })
      .populate("items.product");

    if (!cart || !cart.items || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Cart is empty"
      });
    }

    // ✅ sanitize items
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

    // ✅ CREATE ORDER (FIXED)
    const order = await Order.create({
      user: req.user.id,
      items,
      totalAmount,
      address: address || {},
      paymentMethod: paymentMethod || "COD",
      paymentId: paymentId || null,
      status: paymentMethod === "ONLINE" ? "PAID" : "PENDING"
    });

    // ✅ clear cart
    cart.items = [];
    await cart.save();

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order
    });
  } catch (error) {
    console.error("PLACE ORDER ERROR:", error);
    res.status(500).json({
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
