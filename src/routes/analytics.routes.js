import { Router } from "express";
import { getDashboardStats } from "../controllers/analytics.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";

const router = Router();

router.get(
  "/dashboard",
  protect,
  authorizeRoles("admin"),
  getDashboardStats
);

export default router;
