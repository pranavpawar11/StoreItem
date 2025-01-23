const express = require('express');
const mongoose = require('mongoose');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const Product = require('../models/ProductSchema');
const Counter = require('../models/CounterSchema');
const Stock = require('../models/StockSchema')
const Sales = require('../models/SalesSchema')
const StockHistory = require('../models/StockHistorySchema')
const fetchuser = require('../middlewear/fetchuser');

// Function to get the next sequence value
const getNextSequence = async (name) => {
    try {
        const counter = await Counter.findOneAndUpdate(
            { name },  // Find counter by name
            { $inc: { seq: 1 } }, // Increment seq value by 1
            { new: true, upsert: true } // Create counter if it doesn't exist
        );
        return counter.seq; // Return the updated seq value
    } catch (err) {
        console.error('Error getting next sequence:', err.message);
        throw new Error('Error getting next sequence');
    }
};

router.post('/createproduct', fetchuser, [
    body('name', 'Product name is required').not().isEmpty(),
    body('category', 'Category is required').not().isEmpty(),
    body('unitOfMeasure', 'Unit of measure is required').not().isEmpty(),
    body('description', 'Description is optional').optional(),
    body('initialStock', 'Initial stock is required').isNumeric().not().isEmpty(),  // Add validation for initial stock
    body('price', 'Price is required').isNumeric().not().isEmpty(),  // Add validation for price
    body('expiryDate', 'Expiry date is required').isISO8601().optional(),  // Optional expiry date validation
], async (req, res) => {

    const result = validationResult(req);
    if (!result.isEmpty()) {
        return res.status(400).json({ errors: result.array() });
    }

    try {
        const { name, description, category, subCategory, unitOfMeasure, initialStock, price, expiryDate } = req.body;

        // Check if the product already exists
        const existingProduct = await Product.findOne({ name });
        if (existingProduct) {
            return res.status(400).json({ error: 'Product name already exists' });
        }

        // Get next productId using the sequence function
        const id = await getNextSequence('productId');

        // Create a new product
        const newProduct = new Product({
            productId: id,
            name,
            description,
            category,
            subCategory,
            unitOfMeasure,
        });

        // Save to the database
        const savedProduct = await newProduct.save();

        // Add initial stock
        const newStock = new Stock({
            productId: savedProduct.productId,
            stock: initialStock,
            price,
            expiryDate: expiryDate ? new Date(expiryDate) : null,
        });

        await newStock.save();  // Save initial stock

        res.json({ message: 'Product created and stock added successfully', data: savedProduct });

    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server error");
    }
});


router.put('/updateproduct/:productId', async (req, res) => {
    const { productId } = req.params;
    const { name, description, category, subCategory, unitOfMeasure } = req.body;

    try {
        // Check if product exists
        const product = await Product.findOne({ productId });
        if (!product) {
            return res.status(400).json({ error: 'Product not found' });
        }

        // Update product
        product.name = name || product.name;
        product.description = description || product.description;
        product.category = category || product.category;
        product.subCategory = subCategory || product.subCategory;
        product.unitOfMeasure = unitOfMeasure || product.unitOfMeasure;

        await product.save();
        res.json({ message: 'Product updated successfully', data: product });

    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server error");
    }
});


router.get('/getproducts', async (req, res) => {
    try {
        const products = await Product.find();
        const productIds = products.map(product => product.productId);

        const stocks = await Stock.find({ productId: { $in: productIds } });

        const productData = products.map(product => {
            const stockInfo = stocks.find(stock => stock.productId.toString() === product.productId.toString());
            return {
                productId: product.productId,
                name: product.name,
                description: product.description,
                category: product.category,
                subCategory: product.subCategory,
                unitOfMeasure: product.unitOfMeasure,
                price: stockInfo ? stockInfo.price : null, // Price from Stock
                stock: stockInfo ? stockInfo.stock : 0,    // Stock count from Stock
                expiryDate: stockInfo ? stockInfo.expiryDate : null // Expiry Date
            };
        });

        res.json({ status: true, message: 'Products fetched successfully', data: productData });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ status: false, message: 'Error in fetching Products' });
    }
});


router.delete('/deleteproduct/:productId', async (req, res) => {
    const { productId } = req.params;

    try {
        // Check if product exists
        const product = await Product.findOne({ productId });
        if (!product) {
            return res.status(400).json({ error: 'Product not found' });
        }

        // Check if product has associated sales or stock before deletion
        const salesExist = await Sales.findOne({ productId });
        const stockExist = await Stock.findOne({ productId });

        if (salesExist || stockExist) {
            // If stock exists, get the remaining stock quantity
            if (stockExist) {
                const remainingStock = stockExist.stock;
                return res.json({
                    status: false,
                    message: 'Cannot delete product with associated sales or stock',
                    remainingStock
                });
            } else {
                return res.status(400).json({ status: false, message: 'Cannot delete product with associated sales' });
            }
        }

        // Delete product
        await Product.deleteOne({ productId });

        res.json({ status: true, message: 'Product deleted successfully' });

    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server error");
    }
});


router.post('/addstock', [
    body('products', 'Products array is required').isArray().notEmpty(),
    body('products.*.productId', 'Product ID is required').not().isEmpty(),
    body('products.*.stock', 'Stock quantity should be a valid number').isNumeric(),
    body('products.*.price', 'Price should be a valid number').isNumeric(),
    body('products.*.expiryDate', 'Expiry date should be a valid date').isISO8601()
], async (req, res) => {

    const result = validationResult(req);
    if (!result.isEmpty()) {
        return res.status(400).json({ errors: result.array() });
    }

    try {
        const { products } = req.body;
        let totalStockAdded = 0; // To track total stock added

        // Process each product in the array
        for (let i = 0; i < products.length; i++) {
            const { productId, stock, price, expiryDate } = products[i];

            // Check if the product exists
            const product = await Product.findOne({ productId });
            if (!product) {
                return res.status(400).json({ error: `Product with ID ${productId} not found` });
            }

            // Check if the stock record already exists for the given product
            const existingStock = await Stock.findOne({ productId });

            if (existingStock) {
                // If stock exists, update the stock quantity
                existingStock.stock += stock;  // Add new stock to existing stock
                existingStock.price = price;  // Update price, if necessary
                existingStock.expiryDate = new Date(expiryDate);  // Update expiry date

                // Save the updated stock
                await existingStock.save();
            } else {
                // If no existing stock, create a new stock record
                const newStock = new Stock({
                    productId,
                    stock,
                    price,
                    expiryDate: new Date(expiryDate)
                });

                // Save the new stock record
                await newStock.save();
            }

            // Record the stock addition in history
            const stockHistory = new StockHistory({
                productId,
                stockAdded: stock,
                price,
                expiryDate: new Date(expiryDate)
            });

            // Save stock history
            await stockHistory.save();

            // Track total stock added
            totalStockAdded += stock;
        }

        res.json({ message: 'Stock updated successfully for products', totalStockAdded });

    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server error");
    }
});


router.put('/updateProductAndStock/:productId', async (req, res) => {
    const { productId } = req.params;
    const { name, description, category, subCategory, unitOfMeasure, stock, price, expiryDate } = req.body;

    try {
        // Check if product exists
        const product = await Product.findOne({ productId });
        if (!product) {
            return res.status(400).json({ error: 'Product not found' });
        }

        // Update product details
        product.name = name || product.name;
        product.description = description || product.description;
        product.category = category || product.category;
        product.subCategory = subCategory || product.subCategory;
        product.unitOfMeasure = unitOfMeasure || product.unitOfMeasure;

        // Check if stock exists for product
        let existingStock = await Stock.findOne({ productId });
        if (!existingStock) {
            existingStock = new Stock({ productId, stock: 0, price: 0, expiryDate: new Date() });
        }

        // Update stock information

        existingStock.stock = stock;
        existingStock.price = price || existingStock.price;
        existingStock.expiryDate = expiryDate ? new Date(expiryDate) : existingStock.expiryDate;
        await existingStock.save();

        // Maintain history (optional)
        if (stock) {
            const stockHistory = new StockHistory({
                productId,
                stockAdded: stock,
                price,
                expiryDate: new Date(expiryDate),
                addedAt: new Date()
            });
            await stockHistory.save();
        }

        await product.save();
        res.json({ status: true, message: 'Product and stock updated successfully', data: { product, stock: existingStock } });

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ status: false, message: 'Error in Updating details' });
    }
});

router.post('/createsale', [
    body('products', 'Products array is required').isArray().notEmpty(),
    body('buyerDetails', 'Buyer details are required').notEmpty(),
    body('buyerDetails.gender', 'Gender should be valid').optional().isIn(['male', 'female', 'other']),
    body('buyerDetails.age', 'Age should be a number').optional().isNumeric(),
], async (req, res) => {

    const result = validationResult(req);
    if (!result.isEmpty()) {
        return res.status(400).json({ errors: result.array() });
    }

    try {
        const { products, buyerDetails } = req.body;

        let totalAmount = 0; // To track total amount for all products

        for (let i = 0; i < products.length; i++) {
            const { productId, quantitySold, salePrice, totalSaleAmount } = products[i];

            // Check if the product exists
            const product = await Product.findOne({ productId }); // Use productId as Number here
            if (!product) {
                return res.status(400).json({ error: `Product with ID ${productId} not found` });
            }

            // Check if there's enough stock for the sale
            const stock = await Stock.findOne({ productId }); // Use productId as Number here
            if (!stock || stock.stock < quantitySold) {
                return res.status(400).json({ error: `Not enough stock available for product ID ${productId}` });
            }

            // Update the stock
            stock.stock -= quantitySold;
            await stock.save();

            // Calculate the total sale amount if not provided
            const calculatedTotalSaleAmount = salePrice * quantitySold;
            totalAmount += calculatedTotalSaleAmount;

            // Create sale record for this product
            const sale = new Sales({
                productId, // Use numeric productId directly
                quantitySold,
                salePrice,
                saleDate: new Date(),
                buyerDetails,
                totalSaleAmount: calculatedTotalSaleAmount
            });

            // Save sale to the database
            await sale.save();
        }

        res.json({ status: true, message: 'Sale recorded successfully', totalAmount });

    } catch (err) {
        console.error(err.message);
        res.json({ status: false, message: 'Error in creating sale' });
    }
});


router.get('/getsales', async (req, res) => {
    try {
        // Retrieve all sales and populate the productId field with product details
        const sales = await Sales.find()
            .populate('productId', 'name description')  // Populate product details
            .sort({ saleDate: -1 });  // Optionally, sort sales by date in descending order

        // If no sales are found
        if (sales.length === 0) {
            return res.status(404).json({ message: 'No sales found' });
        }

        res.json({
            status: true,
            message: 'Sales fetched successfully',
            data: sales
        });
    } catch (err) {
        console.error(err.message);
        res.json({
            status: true,
            message: 'Error in fetching salaes data'
        });
    }
});



// Extra APIs

router.get('/getproduct/:productId', async (req, res) => {
    const { productId } = req.params;

    try {
        const product = await Product.findOne({ productId });
        if (!product) {
            return res.status(400).json({ error: 'Product not found' });
        }

        res.json({ message: 'Product fetched successfully', data: product });

    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server error");
    }
});

router.put('/updatestock/:productId', async (req, res) => {
    const { productId } = req.params;
    const { stock, price, expiryDate } = req.body;

    try {
        // Check if product exists
        const product = await Product.findOne({ productId });
        if (!product) {
            return res.status(400).json({ error: 'Product not found' });
        }

        // Check if stock exists for product
        const existingStock = await Stock.findOne({ productId });
        if (!existingStock) {
            return res.status(400).json({ error: 'No stock record found for this product' });
        }

        // Update stock information
        existingStock.stock += stock;
        existingStock.price = price || existingStock.price;
        existingStock.expiryDate = new Date(expiryDate) || existingStock.expiryDate;
        await existingStock.save();

        // Maintain history (optional)
        const stockHistory = new StockHistory({
            productId,
            stockAdded: stock,
            price,
            expiryDate: new Date(expiryDate),
            addedAt: new Date()
        });
        await stockHistory.save();

        res.json({ message: 'Stock updated successfully', data: existingStock });

    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server error");
    }
});

router.get('/getsales/:productId', async (req, res) => {
    try {
        const { productId } = req.params;

        // Convert productId to a number (since it's stored as a Number in the Sales schema)
        const productIdNum = Number(productId);

        // Validate if the productId is a valid number
        if (isNaN(productIdNum)) {
            return res.status(400).json({ error: 'Invalid product ID' });
        }

        // Fetch sales where productId matches the given productId number
        const sales = await Sales.find({ productId: productIdNum })
            .populate('productId', 'name description')  // Populate product details (optional)
            .sort({ saleDate: -1 });  // Optionally, sort sales by date in descending order

        // If no sales are found for the given productId
        if (sales.length === 0) {
            return res.status(404).json({ message: `No sales found for product ID ${productIdNum}` });
        }

        res.json({
            message: 'Sales fetched successfully for product ID ' + productIdNum,
            data: sales
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server error");
    }
});

router.get('/getstockhistory/:productId', async (req, res) => {
    try {
        const { productId } = req.params;

        // Fetch the stock history for the given productId
        const stockHistory = await StockHistory.find({ productId })
            .sort({ addedAt: -1 })  // Sort by added date, most recent first
            .exec();

        if (!stockHistory || stockHistory.length === 0) {
            return res.status(404).json({ error: 'No stock history found for this product' });
        }

        // Return the stock history data
        res.json({ message: 'Stock history fetched successfully', data: stockHistory });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server error");
    }
});

router.get('/salesanalytics', async (req, res) => {
    try {
        // Aggregate data for total sales per product
        const totalSalesPerProduct = await Sales.aggregate([
            {
                $group: {
                    _id: "$productId",
                    totalRevenue: { $sum: "$totalSaleAmount" },
                    totalQuantitySold: { $sum: "$quantitySold" },
                    averageSalePrice: { $avg: "$salePrice" }
                }
            },
            {
                $lookup: {
                    from: "products",
                    localField: "_id",
                    foreignField: "productId",
                    as: "productDetails"
                }
            },
            { $unwind: "$productDetails" },
            {
                $project: {
                    productId: "$_id",
                    productName: "$productDetails.name",
                    totalRevenue: 1,
                    totalQuantitySold: 1,
                    averageSalePrice: 1
                }
            }
        ]);

        // Aggregate data for total sales per category
        const totalSalesPerCategory = await Sales.aggregate([
            {
                $lookup: {
                    from: "products",
                    localField: "productId",
                    foreignField: "productId",
                    as: "productDetails"
                }
            },
            { $unwind: "$productDetails" },
            {
                $group: {
                    _id: "$productDetails.category",
                    totalRevenue: { $sum: "$totalSaleAmount" },
                    totalQuantitySold: { $sum: "$quantitySold" }
                }
            }
        ]);

        // Get top-selling products (highest quantity sold)
        const topSellingProducts = await Sales.aggregate([
            {
                $group: {
                    _id: "$productId",
                    totalQuantitySold: { $sum: "$quantitySold" }
                }
            },
            {
                $sort: { totalQuantitySold: -1 }
            },
            { $limit: 5 },
            {
                $lookup: {
                    from: "products",
                    localField: "_id",
                    foreignField: "productId",
                    as: "productDetails"
                }
            },
            { $unwind: "$productDetails" },
            {
                $project: {
                    productId: "$_id",
                    productName: "$productDetails.name",
                    totalQuantitySold: 1
                }
            }
        ]);

        // Return the aggregated data
        res.json({
            totalSalesPerProduct,
            totalSalesPerCategory,
            topSellingProducts
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server error");
    }
});


module.exports = router;
