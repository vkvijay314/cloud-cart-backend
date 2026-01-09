import { Router } from "express";
import { protect } from "../middlewares/auth.middleware.js";

const router = Router();

/* Protected route */
router.get("/profile", protect, (req, res) => {
  res.json({
    success: true,
    message: "Protected route accessed successfully",
    user: req.user
  });
});

export default router;
