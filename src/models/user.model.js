import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },

    /* PASSWORD ONLY FOR LOCAL USERS */
    password: {
      type: String,
      minlength: 6,
      select: false
    },

    /* AUTH PROVIDER */
    provider: {
      type: String,
      enum: ["local", "google"],
      default: "local"
    },

    /* GOOGLE PROFILE IMAGE */
    avatar: {
      type: String
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user"
    }
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
