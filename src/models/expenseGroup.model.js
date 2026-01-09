import mongoose from "mongoose";

const expenseGroupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
      }
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  { timestamps: true }
);

export default mongoose.model("ExpenseGroup", expenseGroupSchema);
