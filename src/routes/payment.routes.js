import express from "express";
import {
  createRazorpayOrder,
  verifyRazorpayPayment
} from "../controllers/payment.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/create", protect, createRazorpayOrder);
router.post("/verify", protect, verifyRazorpayPayment);

export default router;
