const express = require('express');
const router = express.Router(); // <--- This was missing!
const Expense = require('../models/Expense');

// 1. GET All Expenses
router.get('/', async (req, res) => {
    try {
        const expenses = await Expense.find().sort({ createdAt: -1 });
        res.json(expenses);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// 2. POST (Add) New Expense - UPDATED
router.post('/', async (req, res) => {
    // PRINT DATA TO CONSOLE
    console.log("📥 RECEIVED DATA:", req.body); 

    const { title, amount, category, description, date } = req.body;

    try {
        const expense = new Expense({ title, amount, category, description, date });
        await expense.save();
        res.status(201).json(expense);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// 3. DELETE Expense
router.delete('/:id', async (req, res) => {
    try {
        await Expense.findByIdAndDelete(req.params.id);
        res.json({ message: 'Expense deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;