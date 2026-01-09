import Razorpay from "razorpay";
import crypto from "crypto";
import { env } from "../config/env.js";

/* ==============================
   RAZORPAY INSTANCE (FIXED)
============================== */
const razorpay = new Razorpay({
  key_id: env.RAZORPAY_KEY_ID,
  key_secret: env.RAZORPAY_KEY_SECRET
});

/* ==============================
   CREATE RAZORPAY ORDER
============================== */
export const createRazorpayOrder = async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount) {
      return res.status(400).json({
        success: false,
        message: "Amount is required"
      });
    }

    const order = await razorpay.orders.create({
      amount: amount * 100, // ₹ → paise
      currency: "INR"
    });

    res.json(order);
  } catch (error) {
    console.error("RAZORPAY CREATE ORDER ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create Razorpay order"
    });
  }
};

/* ==============================
   VERIFY RAZORPAY PAYMENT
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

    if (expectedSign === razorpay_signature) {
      return res.json({ success: true });
    }

    return res.status(400).json({
      success: false,
      message: "Payment verification failed"
    });
  } catch (error) {
    console.error("RAZORPAY VERIFY ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Payment verification error"
    });
  }
};
