const { body, validationResult } = require('express-validator');
const express = require('express');
const router = express.Router();
const fetchuser = require('../middlewear/fetchuser');
const Category = require('../models/CategorySchema');
const Product = require('../models/ProductSchema');
const Counter = require('../models/CounterSchema');


const getNextSequence = async (name) => {
    try {
        const counter = await Counter.findOneAndUpdate(
            { name },  // Find counter by name (category in this case)
            { $inc: { seq: 1 } }, // Increment seq value by 1
            { new: true, upsert: true } // Create counter if it doesn't exist
        );
        return counter.seq; // Return the updated seq value
    } catch (err) {
        console.error('Error getting next sequence:', err.message);
        throw new Error('Error getting next sequence');
    }
};

router.post('/createcategory', fetchuser, [
    body('name', 'Category name is required').not().isEmpty(),
    body('description', 'Description is optional').optional().isString()
], async (req, res) => {

    const result = validationResult(req);
    if (!result.isEmpty()) {
        return res.status(400).json({ errors: result.array() });
    }

    try {
        const { name, description } = req.body;

        // Check if the category already exists
        const existingCategory = await Category.findOne({ name });
        if (existingCategory) {
            return res.status(400).json({ error: 'Category name already exists' });
        }

        // Get the next categoryId using the sequence function
        const id = await getNextSequence('categoryId');

        // Create a new category
        const newCategory = new Category({
            categoryId: id,
            name,
            description
        });

        // Save the new category to the database
        const savedCategory = await newCategory.save();

        res.json({ message: 'Category created successfully', data: savedCategory });

    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server error");
    }
});

router.get('/categories', async (req, res) => {
    try {
        const categories = await Category.find();
        res.json({ message: 'Categories fetched successfully', data: categories });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

router.get('/category/:categoryId', async (req, res) => {
    const { categoryId } = req.params;

    try {
        const category = await Category.findOne({categoryId});
        if (!category) {
            return res.status(400).json({ error: 'Category not found' });
        }
        res.json({ message: 'Category fetched successfully', data: category });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

router.put('/updatecategory/:categoryId', [
    body('name', 'Category name should be a string').optional().isString(),
    body('description', 'Description should be a string').optional().isString()
], async (req, res) => {
    const { categoryId } = req.params;
    const result = validationResult(req);
    if (!result.isEmpty()) {
        return res.status(400).json({ errors: result.array() });
    }

    try {
        const { name, description } = req.body;

        // Find the category by categoryId and update
        const category = await Category.findOne({ categoryId });
        if (!category) {
            return res.status(400).json({ error: 'Category not found' });
        }

        // Prevent duplicate name if it's updated
        if (name && name !== category.name) {
            const existingCategory = await Category.findOne({ name });
            if (existingCategory) {
                return res.status(400).json({ error: 'Category name already exists' });
            }
        }

        // Update category fields
        if (name) category.name = name;
        if (description) category.description = description;

        await category.save();

        res.json({ message: 'Category updated successfully', data: category });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

router.delete('/deletecategory/:categoryId', async (req, res) => {
    const { categoryId } = req.params;

    try {
        // Find the category by ID
        const category = await Category.findOne({categoryId});
        if (!category) {
            return res.status(400).json({ error: 'Category not found' });
        }

        // Delete the category using the deleteOne method
        await Category.deleteOne({ categoryId: categoryId });

        res.json({ message: 'Category deleted successfully' });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});


module.exports = router;