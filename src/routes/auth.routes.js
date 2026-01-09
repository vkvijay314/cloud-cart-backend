import { Router } from "express";
import {
  register,
  login,
  googleAuth
} from "../controllers/auth.controller.js";

const router = Router();

/* EMAIL / PASSWORD */
router.post("/register", register);
router.post("/login", login);

/* GOOGLE LOGIN / REGISTER */
router.post("/google", googleAuth);

export default router;
