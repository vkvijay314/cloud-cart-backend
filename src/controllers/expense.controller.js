import ExpenseGroup from "../models/expenseGroup.model.js";
import Expense from "../models/expense.model.js";
import User from "../models/user.model.js";

/* ==============================
   HELPER: EMAILS → USER IDS
============================== */
const getUsersByEmails = async (emails) => {
  const users = await User.find({ email: { $in: emails } });
  if (users.length !== emails.length) {
    throw new Error("One or more emails are not registered");
  }
  return users;
};

/* ==============================
   CREATE GROUP (EMAIL-BASED)
============================== */
export const createGroup = async (req, res, next) => {
  try {
    const { name, members } = req.body;

    if (!name || !Array.isArray(members) || members.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Group name and member emails required"
      });
    }

    const users = await getUsersByEmails(members);

    const group = await ExpenseGroup.create({
      name,
      members: users.map(u => u._id),
      createdBy: req.user.id
    });

    res.status(201).json({ success: true, group });
  } catch (error) {
    next(error);
  }
};

/* ==============================
   ADD EXPENSE (EMAIL-BASED)
============================== */
export const addExpense = async (req, res, next) => {
  try {
    const { groupId, amount, participants, description } = req.body;

    if (!groupId || !amount || !participants?.length) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields"
      });
    }

    const users = await getUsersByEmails(participants);

    const expense = await Expense.create({
      group: groupId,
      paidBy: req.user.id,
      amount,
      participants: users.map(u => u._id),
      description
    });

    res.status(201).json({ success: true, expense });
  } catch (error) {
    next(error);
  }
};

/* ==============================
   GET BALANCES (WITH NAMES)
============================== */
export const getGroupBalances = async (req, res, next) => {
  try {
    const expenses = await Expense.find({ group: req.params.groupId });

    const balanceMap = {};

    expenses.forEach(exp => {
      const share = exp.amount / exp.participants.length;

      exp.participants.forEach(uid => {
        const id = uid.toString();
        balanceMap[id] = (balanceMap[id] || 0) - share;
      });

      const payer = exp.paidBy.toString();
      balanceMap[payer] = (balanceMap[payer] || 0) + exp.amount;
    });

    const users = await User.find({
      _id: { $in: Object.keys(balanceMap) }
    }).select("name email");

    const namedBalances = {};
    users.forEach(u => {
      namedBalances[u.name || u.email] = balanceMap[u._id.toString()];
    });

    res.json({ success: true, balance: namedBalances });
  } catch (error) {
    next(error);
  }
};
