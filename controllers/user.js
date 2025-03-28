const Expense = require('../models/Expense');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { BlobServiceClient } = require('@azure/storage-blob');
const { v1: uuidv1 } = require('uuid');

exports.deleteMonthExpense = async (req, res) => {
  try {
    const expenseId = req.params.id;
    const signupEmail = req.user.email;

    if (!expenseId) {
      return res.status(400).json({ message: "Expense ID not provided" });
    }

    const expense = await Expense.findOneAndDelete({ _id: expenseId, signupEmail });
    if (!expense) {
      return res.status(404).json({ message: "Expense not found." });
    }

    const user = await User.findOne({ email: signupEmail });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    user.total -= (expense.credit - expense.debit);
    await user.save();

    res.status(200).json({ message: "Expense deleted successfully", newTotal: user.total });
  } catch (error) {
    console.error("Error deleting expense:", error);
    res.status(500).json({ message: "An error occurred while deleting the expense.", error });
  }
};

exports.getMonthExpenses = async (req, res) => {
  try {

    const ITEMS_PER_PAGE = parseInt(req.params.rows, 10);
    const page = +req.query.page || 1;
    const signupEmail = req.user.email;
    const { month, year } = req.params;

    const totalItems = await Expense.countDocuments({ month, year, signupEmail });
    const expenses = await Expense.find({ month, year, signupEmail })
      .skip((page - 1) * ITEMS_PER_PAGE)
      .limit(ITEMS_PER_PAGE);
    res.json({
      expenses,
      currentPage: page,
      hasNextPage: ITEMS_PER_PAGE * page < totalItems,
      nextPage: page + 1,
      hasPreviousPage: page > 1,
      previousPage: page - 1,
      lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Failed to fetch expenses." });
  }
};
exports.getYearExpenses = async (req, res) => {
  try {
    console.log("--------------------------------------------------------------------------------------------------");
    
    const year = parseInt(req.params.year); // Convert year to a number
    const signupEmail = req.user.email.trim().toLowerCase(); // Normalize email case

    console.log("User Email:", signupEmail, "Year:", year);

    const expenses = await Expense.aggregate([
      { 
        $match: { 
          year, 
          signupEmail 
        } 
      },
      {
        $group: {
          _id: "$month",
          totalCredit: { $sum: "$credit" },
          totalDebit: { $sum: "$debit" },
        },
      },
      { $sort: { _id: 1 } } // Sort by month
    ]);

    console.log("Expenses:", expenses);
    res.status(200).json({ expenses, success: true });

  } catch (err) {
    console.error("Error fetching year expenses:", err);
    res.status(500).json({ error: "An error occurred while fetching expenses." });
  }
};


exports.getExpense = async (req, res) => {
  try {
    const { day, month, year } = req.params;
    const email = req.user.email;
    console.log(req.params);

    const expenses = await Expense.find({ signupEmail: email, day, month, year });
    const expensesTillDay = await Expense.find({ signupEmail: email, day: { $lt: day }, month, year });

    if (expenses.length === 0 && expensesTillDay.length === 0) {
      return res.status(404).json({ message: "No expenses found for the specified date." });
    }

    res.status(200).json({ expenses, expensesTillDay });
  } catch (error) {
    console.error("Error fetching expenses:", error);
    res.status(500).json({ message: "An error occurred while fetching expenses." });
  }
};

exports.postUser = async (req, res) => {
  try {
    const { day, month, year, credit = 0, debit = 0, description } = req.body;
    const email = req.user.email;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    const userId=user._id;
    console.log(user._id + "----------------------------------------------------------------------------");
    const newExpense = new Expense({ day, month, year, credit, debit, description, signupEmail: email, userId});
    await newExpense.save();

    


    user.total += (credit - debit);
    await user.save();

    res.status(201).json({ newExpense });
  } catch (error) {
    console.error("Error processing transaction:", error);
    res.status(500).json({ error: "An error occurred while processing the transaction." });
  }
};

exports.postLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ success: false, message: "Invalid email or password." });
    }

    const token = jwt.sign({ email: user.email, isPremium: user.isPremium }, '8hy98h9yu89y98yn89y98y89');
    res.status(200).json({ success: true, message: "User logged in successfully", token });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ message: "An error occurred during login." });
  }
};

exports.postSignup = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (await User.findOne({ email })) {
      return res.status(400).json({ message: "User already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: "User created successfully." });
  } catch (error) {
    console.error("Error during signup:", error);
    res.status(500).json({ message: "An error occurred during signup." });
  }
};

exports.downloadExpenses = async (req, res) => {
  try {
    const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING;
    if (!AZURE_STORAGE_CONNECTION_STRING) {
      return res.status(500).json({ success: false, message: "Azure connection string is not defined." });
    }

    const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
    const containerClient = blobServiceClient.getContainerClient('expenses-container');
    const blobName = `expenses-${uuidv1()}.txt`;
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    const data = JSON.stringify(await Expense.find({ signupEmail: req.user.email }));
    await blockBlobClient.upload(data, Buffer.byteLength(data));

    res.status(201).json({ fileUrl: `${blobServiceClient.url}/expenses-container/${blobName}`, success: true });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ success: false, message: 'Something went wrong.' });
  }
};
