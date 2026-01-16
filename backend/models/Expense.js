const mongoose = require('mongoose');

const ExpenseSchema = new mongoose.Schema({
    title: { type: String, required: true },
    amount: { type: Number, required: true },
    category: { type: String, required: true },
    description: { type: String },  // New Field
    date: { type: Date, default: Date.now }, // New Field
}, { timestamps: true });

module.exports = mongoose.model('Expense', ExpenseSchema);