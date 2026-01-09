import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true
    },
    name: String,
    price: Number,
    quantity: {
      type: Number,
      required: true
    }
  },
  { _id: false }
);

const addressSchema = new mongoose.Schema(
  {
    name: String,
    phone: String,
    line: String,
    city: String,
    pincode: String
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    items: [orderItemSchema],

    totalAmount: {
      type: Number,
      required: true
    },

    address: addressSchema, // ✅ NEW (OPTIONAL)

    paymentMethod: {
      type: String,
      enum: ["COD", "ONLINE"],
      default: "COD"
    },

    status: {
      type: String,
      enum: ["placed", "shipped", "delivered"],
      default: "placed"
    }
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
