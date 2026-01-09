import { Router } from "express";

const router = Router();

router.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Backend is healthy 🚀",
    timestamp: new Date().toISOString()
  });
});

export default router;
