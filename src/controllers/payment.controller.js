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
   CREATE CHECKOUT ORDER
   (Amount calculated from cart)
============================== */
export const createRazorpayOrder = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id })
      .populate("items.product");

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Cart is empty"
      });
    }

    // 🔐 Secure amount calculation (server-side)
    const amount = cart.items.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );

    const order = await razorpay.orders.create({
      amount: amount * 100, // INR → paise
      currency: "INR",
      receipt: `receipt_${Date.now()}`
    });

    res.json({
      success: true,
      orderId: order.id,
      amount,
      currency: "INR"
    });
  } catch (error) {
    console.error("RAZORPAY CREATE ORDER ERROR:", error);
    res.status(500).json({
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
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    } = req.body;

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

    // ✅ Fetch cart again
    const cart = await Cart.findOne({ user: req.user.id })
      .populate("items.product");

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Cart not found"
      });
    }

    const totalAmount = cart.items.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );

    // ✅ Save order
    await Order.create({
      user: req.user.id,
      items: cart.items,
      totalAmount,
      paymentId: razorpay_payment_id,
      status: "paid"
    });

    // ✅ Clear cart
    cart.items = [];
    await cart.save();

    res.json({
      success: true,
      message: "Payment verified & order placed"
    });
  } catch (error) {
    console.error("RAZORPAY VERIFY ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Payment verification error"
    });
  }
};
