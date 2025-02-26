const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
    day: { type: Number, required: true }, // Day of the expense
    month: { type: String, required: true }, // Month of the expense
    year: { type: Number, required: true }, // Year of the expense
    credit: { type: Number, default: 0 }, // Amount credited
    debit: { type: Number, default: 0 }, // Amount debited
    description: { type: String, required: true }, // Expense description
    signupEmail: { type: String, required: true }, // Stores the user's email for easy querying
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true } // Reference to User
}, { timestamps: true }); // Adds createdAt and updatedAt timestamps

const Expense = mongoose.model('Expense', expenseSchema);
module.exports = Expense;
