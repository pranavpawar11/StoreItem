const express = require('express');
const router = express.Router();
const Sales = require('../models/SalesSchema');
const Stock = require('../models/StockSchema');
const Product = require('../models/ProductSchema');

router.get('/', async (req, res) => {
    const { startDate, endDate } = req.query;
    
    try {
        // Date range filter
        let dateFilter = {};
        if (startDate && endDate) {
            dateFilter = {
                saleDate: {
                    $gte: new Date(startDate),
                    $lte: new Date(endDate)
                }
            };
        }

        // Overall KPIs
        const overallMetrics = await Sales.aggregate([
            { $match: dateFilter },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: "$totalSaleAmount" },
                    totalSales: { $sum: 1 },
                    avgOrderValue: { $avg: "$totalSaleAmount" },
                    totalQuantitySold: { $sum: "$quantitySold" }
                }
            }
        ]);

        // Sales Trend (Last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        
        const salesTrend = await Sales.aggregate([
            {
                $match: {
                    saleDate: { $gte: sevenDaysAgo }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$saleDate" } },
                    sales: { $sum: "$totalSaleAmount" },
                    count: { $sum: 1 }
                }
            },
            { $sort: { "_id": 1 } }
        ]);

        // Top Products
        const topProducts = await Sales.aggregate([
            { $match: dateFilter },
            {
                $group: {
                    _id: "$productId",
                    totalRevenue: { $sum: "$totalSaleAmount" },
                    totalSales: { $sum: 1 }
                }
            },
            {
                $lookup: {
                    from: "products",
                    localField: "_id",
                    foreignField: "productId",
                    as: "productInfo"
                }
            },
            { $unwind: "$productInfo" },
            { $sort: { totalRevenue: -1 } },
            { $limit: 5 }
        ]);

        // Stock Alerts
        const stockAlerts = await Stock.aggregate([
            {
                $match: {
                    $or: [
                        { stock: { $lt: 10 } },
                        { expiryDate: { $lt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) } }
                    ]
                }
            },
            {
                $lookup: {
                    from: "products",
                    localField: "productId",
                    foreignField: "productId",
                    as: "productInfo"
                }
            },
            { $unwind: "$productInfo" },
            { $limit: 5 }
        ]);

        // Get previous period metrics for comparison
        const previousPeriodMetrics = await Sales.aggregate([
            {
                $match: {
                    saleDate: {
                        $gte: new Date(new Date().setDate(new Date().getDate() - 60)),
                        $lt: new Date(new Date().setDate(new Date().getDate() - 30))
                    }
                }
            },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: "$totalSaleAmount" },
                    totalSales: { $sum: 1 }
                }
            }
        ]);

        res.json({
            success: true,
            data: {
                kpis: {
                    ...overallMetrics[0],
                    previousPeriod: previousPeriodMetrics[0] || { totalRevenue: 0, totalSales: 0 }
                },
                salesTrend,
                topProducts,
                stockAlerts
            }
        });

    } catch (error) {
        console.error('Dashboard API Error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

module.exports = router;