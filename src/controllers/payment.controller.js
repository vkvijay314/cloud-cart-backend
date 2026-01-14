import Razorpay from "razorpay";
import crypto from "crypto";
import Cart from "../models/cart.model.js";
import Order from "../models/order.model.js";
import { env } from "../config/env.js";

/* ==============================
   RAZORPAY INSTANCE
============================== */
const razorpay = new Razorpay({
  key_id: env.RAZORPAY_KEY_ID,
  key_secret: env.RAZORPAY_KEY_SECRET
});

/* ==============================
   CREATE RAZORPAY ORDER
   (Amount calculated from cart)
============================== */
export const createRazorpayOrder = async (req, res) => {
  try {
    // ✅ FIXED USER ID
    const userId = req.user._id;

    const cart = await Cart.findOne({ user: userId })
      .populate("items.product");

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Cart is empty"
      });
    }

    // 🔐 Secure amount calculation
    const amount = cart.items.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );

    const order = await razorpay.orders.create({
      amount: amount * 100, // INR → paise
      currency: "INR",
      receipt: `receipt_${Date.now()}`
    });

    return res.json({
      success: true,
      id: order.id,
      amount: order.amount, // paise
      currency: "INR"
    });
  } catch (error) {
    console.error("RAZORPAY CREATE ORDER ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create Razorpay order"
    });
  }
};

/* ==============================
   VERIFY PAYMENT & PLACE ORDER
============================== */
export const verifyRazorpayPayment = async (req, res) => {
  try {
    const userId = req.user._id;

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    } = req.body;

    // 🔐 Verify signature
    const sign = `${razorpay_order_id}|${razorpay_payment_id}`;

    const expectedSign = crypto
      .createHmac("sha256", env.RAZORPAY_KEY_SECRET)
      .update(sign)
      .digest("hex");

    if (expectedSign !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Payment verification failed"
      });
    }

    // ✅ FETCH CART ONLY ONCE (NOW IT EXISTS)
    const cart = await Cart.findOne({ user: userId })
      .populate("items.product");

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Cart is empty"
      });
    }

    const items = cart.items.map(item => ({
      product: item.product._id,
      name: item.product.name,
      price: item.product.price,
      quantity: item.quantity
    }));

    const totalAmount = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    // ✅ CREATE ORDER AFTER PAYMENT
    const order = await Order.create({
      user: userId,
      items,
      totalAmount,
      paymentMethod: "ONLINE",
      paymentId: razorpay_payment_id,
      status: "paid"
    });

    // ✅ CLEAR CART AFTER ORDER
    cart.items = [];
    await cart.save();

    return res.json({
      success: true,
      message: "Payment verified & order placed",
      order
    });
  } catch (error) {
    console.error("RAZORPAY VERIFY ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Payment verification error"
    });
  }
};
