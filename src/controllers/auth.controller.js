import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import User from "../models/user.model.js";
import { generateToken } from "../utils/token.js";
import { env } from "../config/env.js";

/* ===============================
   GOOGLE CLIENT
================================ */
const googleClient = new OAuth2Client(env.GOOGLE_CLIENT_ID);

/* ===============================
   REGISTER (EMAIL / PASSWORD)
================================ */
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      provider: "local"
    });

    const token = generateToken({
      id: user._id,
      role: user.role
    });

    return res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/* ===============================
   LOGIN (EMAIL / PASSWORD)
================================ */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 🔒 Input validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required"
      });
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials"
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials"
      });
    }

    const token = generateToken({
      id: user._id,
      role: user.role
    });

    // ✅ ALWAYS return a response (prevents 204)
    return res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    // ❗ DO NOT call next(error) here
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/* ===============================
   GOOGLE LOGIN / REGISTER
================================ */
export const googleAuth = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Google token missing"
      });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    const { email, name, picture } = payload;

    let user = await User.findOne({ email });

    // 🔹 Auto-register if new user
    if (!user) {
      user = await User.create({
        name,
        email,
        avatar: picture,
        provider: "google"
      });
    }

    const jwtToken = generateToken({
      id: user._id,
      role: user.role
    });

    return res.status(200).json({
      success: true,
      token: jwtToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      }
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Google authentication failed"
    });
  }
};

