import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Not authorized, token missing"
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);

    // ✅ normalize user object (VERY IMPORTANT)
    req.user = {
      id: decoded.id,
      role: decoded.role
    };

    next();
  } catch (error) {
    console.error("AUTH ERROR:", error);
    return res.status(401).json({
      success: false,
      message: "Token invalid or expired"
    });
  }
};
