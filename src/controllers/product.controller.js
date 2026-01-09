import Product from "../models/product.model.js";
import cloudinary from "../config/cloudinary.js";

/* ==============================
   HELPER: UPLOAD IMAGE
============================== */
const uploadImageToCloudinary = async (file) => {
  if (!file) return null;

  const result = await cloudinary.uploader.upload(
    `data:${file.mimetype};base64,${file.buffer.toString("base64")}`,
    { folder: "cloudcart-products" }
  );

  return result.secure_url;
};

/* ==============================
   CREATE PRODUCT
============================== */
export const createProduct = async (req, res) => {
  try {
    const imageUrl = await uploadImageToCloudinary(req.file);

    const product = await Product.create({
      name: req.body.name,
      price: req.body.price,
      description: req.body.description,
      category: req.body.category,
      image: imageUrl,
      createdBy: req.user.id
    });

    res.status(201).json({ success: true, product });
  } catch (error) {
    console.error("CREATE PRODUCT ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Image upload or product save failed"
    });
  }
};

/* ==============================
   GET ALL PRODUCTS
============================== */
export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.json({ success: true, products });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch products" });
  }
};

/* ==============================
   GET PRODUCT BY ID
============================== */
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: "Not found" });
    }

    res.json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch product" });
  }
};

/* ==============================
   UPDATE PRODUCT
============================== */
export const updateProduct = async (req, res) => {
  try {
    const updateData = {
      name: req.body.name,
      price: req.body.price,
      description: req.body.description,
      category: req.body.category
    };

    const imageUrl = await uploadImageToCloudinary(req.file);
    if (imageUrl) updateData.image = imageUrl;

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    res.json({ success: true, product });
  } catch (error) {
    console.error("UPDATE PRODUCT ERROR:", error);
    res.status(500).json({ success: false, message: "Failed to update product" });
  }
};

/* ==============================
   DELETE PRODUCT
============================== */
export const deleteProduct = async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to delete product" });
  }
};
