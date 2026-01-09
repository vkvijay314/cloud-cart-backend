import User from "../models/user.model.js";
import Product from "../models/product.model.js";
import Order from "../models/order.model.js";
import Expense from "../models/expense.model.js";

/* ADMIN DASHBOARD STATS */
export const getDashboardStats = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalProducts,
      totalOrders,
      orders,
      expenses
    ] = await Promise.all([
      User.countDocuments(),
      Product.countDocuments(),
      Order.countDocuments(),
      Order.find(),
      Expense.find()
    ]);

    const totalRevenue = orders.reduce(
      (sum, order) => sum + order.totalAmount,
      0
    );

    const ordersByStatus = orders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {});

    const totalExpenseAmount = expenses.reduce(
      (sum, exp) => sum + exp.amount,
      0
    );

    res.json({
      success: true,
      stats: {
        users: totalUsers,
        products: totalProducts,
        orders: totalOrders,
        revenue: totalRevenue,
        ordersByStatus,
        totalExpenseAmount
      }
    });
  } catch (error) {
    next(error);
  }
};
