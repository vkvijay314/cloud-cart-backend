import { Router } from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";

const router = Router();

/* Admin-only route */
router.get(
  "/dashboard",
  protect,
  authorizeRoles("admin"),
  (req, res) => {
    res.json({
      success: true,
      message: "Welcome Admin 👑",
      user: req.user
    });
  }
);

export default router;
