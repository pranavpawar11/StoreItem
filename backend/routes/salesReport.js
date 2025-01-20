const { body, validationResult } = require('express-validator');
const express = require('express');
const router = express.Router();
const fetchuser = require('../middlewear/fetchuser');
const Sales = require('../models/SalesSchema')
const Stock = require('../models/StockSchema')

router.get('/salesreport', async (req, res) => {
    const { startDate, endDate, productId, category } = req.body;

    try {
        let query = {};

        if (startDate && endDate) {
            query.saleDate = { $gte: new Date(startDate), $lte: new Date(endDate) };
        }

        if (productId) {
            query.productId = productId;
        }

        if (category) {
            query.category = category;
        }

        // Fetch the sales data based on the query
        const sales = await Sales.aggregate([
            { $match: query },
            {
                $group: {
                    _id: null,
                    totalSales: { $sum: "$totalSaleAmount" },
                    totalQuantity: { $sum: "$quantitySold" }
                }
            }
        ]);

        res.json({ message: 'Sales report generated successfully', data: sales });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});


router.get('/inventoryreport', async (req, res) => {
    // const { productId } = req.params;

    try {

        // Fetch the inventory data based on the query
        const inventoryReport = await Stock.aggregate([
            // { $match: query },
            {
                $lookup: {
                    from: 'sales', // Assuming the collection name for sales is 'sales'
                    localField: 'productId',
                    foreignField: 'productId',
                    as: 'salesData'
                }
            },
            {
                $project: {
                    productId: 1,
                    stock: 1,
                    totalSales: { $sum: { $map: { input: "$salesData", as: "sale", in: "$sale.quantitySold" } } }
                }
            }
        ]);

        res.json({ message: 'Inventory report generated successfully', data: inventoryReport });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});


router.get('/profitlossreport', async (req, res) => {
    const { startDate, endDate, productId } = req.query;

    try {
        // Build the query for sales and stock data
        let salesQuery = {};
        if (startDate && endDate) {
            salesQuery.saleDate = { $gte: new Date(startDate), $lte: new Date(endDate) };
        }

        if (productId) {
            salesQuery.productId = productId;
        }

        // Fetch the sales data based on the query
        const salesData = await Sales.aggregate([
            { $match: salesQuery },
            {
                $group: {
                    _id: "$productId",
                    totalSales: { $sum: "$totalSaleAmount" },
                    totalQuantity: { $sum: "$quantitySold" }
                }
            }
        ]);

        // Fetch the stock prices for the products
        const stockData = await Stock.aggregate([
            { $match: { productId: { $in: salesData.map(sale => sale._id) } } },
            {
                $project: {
                    productId: 1,
                    price: 1
                }
            }
        ]);

        // Calculate profit or loss for each product
        const profitLossReport = salesData.map(sale => {
            const stock = stockData.find(s => s.productId === sale._id);
            if (stock) {
                const costPrice = stock.price * sale.totalQuantity; // Total cost price for sold quantity
                const profitOrLoss = sale.totalSales - costPrice;
                return {
                    productId: sale._id,
                    totalSales: sale.totalSales,
                    totalQuantity: sale.totalQuantity,
                    profitOrLoss
                };
            }
            return { productId: sale._id, profitOrLoss: 'No stock data available' };
        });

        res.json({ message: 'Profit/Loss report generated successfully', data: profitLossReport });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});


module.exports = router;