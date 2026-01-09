import { Router } from "express";
import {
  getCart,
  addToCart,
  removeFromCart,
  updateCartQuantity
} from "../controllers/cart.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(protect);

router.get("/", getCart);
router.post("/add", addToCart);
router.put("/update", updateCartQuantity); // ✅ REQUIRED
router.delete("/remove", removeFromCart);

export default router;
