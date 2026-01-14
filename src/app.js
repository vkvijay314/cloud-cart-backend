import express from "express";
import cors from "cors";

import paymentRoutes from "./routes/payment.routes.js";
import analyticsRoutes from "./routes/analytics.routes.js";
import expenseRoutes from "./routes/expense.routes.js";
import orderRoutes from "./routes/order.routes.js";
import cartRoutes from "./routes/cart.routes.js";
import productRoutes from "./routes/product.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import healthRoutes from "./routes/health.routes.js";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";

import { errorHandler } from "./middlewares/error.middleware.js";

const app = express();

/* 1️⃣ CORS FIRST */
app.use(cors({
  origin: "https://cloud-cart-frontend1.vercel.app",
  credentials: true
}));

/* 2️⃣ PREFLIGHT */
app.options("*", cors());

/* 3️⃣ BODY PARSER */
app.use(express.json());

/* 4️⃣ ROUTES */
app.use("/api/auth", authRoutes);

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ===============================
   ROUTES
================================ */
app.use("/api/health", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/expense", expenseRoutes);
app.use("/api/user", userRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);

/* ===============================
   ERROR HANDLER (LAST)
================================ */
app.use(errorHandler);

export default app;
