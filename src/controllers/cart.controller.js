import Cart from "../models/cart.model.js";
import Product from "../models/product.model.js";

/* ==============================
   GET USER CART
============================== */
export const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id })
      .populate("items.product");

    res.json({
      success: true,
      cart: cart || { items: [] }
    });
  } catch (error) {
    console.error("Get cart error:", error);
    res.status(500).json({ message: "Failed to fetch cart" });
  }
};

/* ==============================
   ADD TO CART
============================== */
export const addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    let cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      cart = await Cart.create({
        user: req.user.id,
        items: [{ product: productId, quantity }]
      });
    } else {
      const itemIndex = cart.items.findIndex(
        item => item.product.toString() === productId
      );

      if (itemIndex > -1) {
        cart.items[itemIndex].quantity += quantity;
      } else {
        cart.items.push({ product: productId, quantity });
      }

      await cart.save();
    }

    res.json({
      success: true,
      cart
    });
  } catch (error) {
    console.error("Add to cart error:", error);
    res.status(500).json({ message: "Failed to add to cart" });
  }
};

/* ==============================
   UPDATE QUANTITY (🔥 FIX)
============================== */
export const updateCartQuantity = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    if (!productId || quantity < 1) {
      return res.status(400).json({
        message: "Invalid productId or quantity"
      });
    }

    const cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      return res.status(404).json({
        message: "Cart not found"
      });
    }

    const item = cart.items.find(
      item => item.product.toString() === productId
    );

    if (!item) {
      return res.status(404).json({
        message: "Item not found in cart"
      });
    }

    item.quantity = quantity;
    await cart.save();

    res.json({
      success: true,
      cart
    });
  } catch (error) {
    console.error("Update quantity error:", error);
    res.status(500).json({ message: "Failed to update quantity" });
  }
};

/* ==============================
   REMOVE FROM CART
============================== */
export const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.body;

    const cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      return res.status(404).json({
        message: "Cart not found"
      });
    }

    cart.items = cart.items.filter(
      item => item.product.toString() !== productId
    );

    await cart.save();

    res.json({
      success: true,
      cart
    });
  } catch (error) {
    console.error("Remove cart error:", error);
    res.status(500).json({ message: "Failed to remove item" });
  }
};
