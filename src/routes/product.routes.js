import { Router } from "express";
import {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct
} from "../controllers/product.controller.js";

import { protect } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";
import upload from "../middlewares/upload.middleware.js";

const router = Router();

/* PUBLIC */
router.get("/", getAllProducts);
router.get("/:id", getProductById);

/* ADMIN ONLY */
router.post(
  "/",
  protect,
  authorizeRoles("admin"),
  upload.single("image"), // ✅ MUST BE HERE
  createProduct
);

router.put(
  "/:id",
  protect,
  authorizeRoles("admin"),
  upload.single("image"),
  updateProduct
);

router.delete("/:id", protect, authorizeRoles("admin"), deleteProduct);

export default router;
