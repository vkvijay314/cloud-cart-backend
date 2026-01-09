import { Router } from "express";
import {
  createGroup,
  addExpense,
  getGroupBalances
} from "../controllers/expense.controller.js";

import { protect } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(protect);

router.post("/group", createGroup);
router.post("/add", addExpense);
router.get("/balance/:groupId", getGroupBalances);

export default router;
