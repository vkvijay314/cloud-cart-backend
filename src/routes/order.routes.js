import { Router } from "express";
import {
  placeOrder,
  getMyOrders,
  getAllOrders
} from "../controllers/order.controller.js";

import { protect } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";

const router = Router();

/* USER */
router.post("/", protect, placeOrder);
router.get("/my", protect, getMyOrders);

/* ADMIN */
router.get("/", protect, authorizeRoles("admin"), getAllOrders);

export default router;
