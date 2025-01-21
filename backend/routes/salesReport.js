const { body, validationResult } = require('express-validator');
const express = require('express');
const router = express.Router();
const fetchuser = require('../middlewear/fetchuser');
const Sales = require('../models/SalesSchema')
const Stock = require('../models/StockSchema')

const Product = require('../models/ProductSchema')
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
            salesQuery.productId = Number(productId);
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
            { $match: { productId: { $in: salesData.map(sale => sale._id.toString()) } } },
            {
                $group: {
                    _id: "$productId",
                    averageCostPrice: { $avg: "$price" }
                }
            }
        ]);

        // Calculate profit or loss for each product
        const profitLossReport = salesData.map(sale => {
            const stock = stockData.find(s => s._id === sale._id.toString());
            if (stock) {
                const costPrice = stock.averageCostPrice * sale.totalQuantity;
                const profitOrLoss = sale.totalSales - costPrice;
                const margin = ((profitOrLoss / costPrice) * 100).toFixed(2);
                return {
                    productId: sale._id,
                    totalSales: sale.totalSales,
                    totalQuantity: sale.totalQuantity,
                    costPrice: costPrice.toFixed(2),
                    profitOrLoss: profitOrLoss.toFixed(2),
                    margin: `${margin}%`,
                    status: profitOrLoss > 0 ? 'Profit' : 'Loss'
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

router.get('/salesbyproduct', async (req, res) => {
    const { startDate, endDate } = req.query;

    try {
        // Build the query for sales data
        let salesQuery = {};
        if (startDate && endDate) {
            salesQuery.saleDate = { $gte: new Date(startDate), $lte: new Date(endDate) };
        }

        // Fetch sales data grouped by product
        const salesData = await Sales.aggregate([
            { $match: salesQuery },
            {
                $group: {
                    _id: "$productId",
                    totalSales: { $sum: "$totalSaleAmount" },
                    totalQuantity: { $sum: "$quantitySold" }
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
            {
                $unwind: "$productDetails"
            },
            {
                $project: {
                    productId: "$_id",
                    productName: "$productDetails.name",
                    category: "$productDetails.category",
                    brand: "$productDetails.subCategory",
                    totalSales: 1,
                    totalQuantity: 1
                }
            }
        ]);

        res.json({ message: 'Sales by product report generated successfully', data: salesData });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});


router.get('/top-least-product', async (req, res) => {
    const { startDate, endDate } = req.query;

    try {
        // Build the query for sales data
        let salesQuery = {};
        if (startDate && endDate) {
            salesQuery.saleDate = { $gte: new Date(startDate), $lte: new Date(endDate) };
        }

        // Fetch sales data grouped by product
        const salesData = await Sales.aggregate([
            { $match: salesQuery },
            {
                $group: {
                    _id: "$productId",
                    totalSales: { $sum: "$totalSaleAmount" },
                    totalQuantity: { $sum: "$quantitySold" }
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
            {
                $unwind: "$productDetails"
            },
            {
                $project: {
                    productId: "$_id",
                    productName: "$productDetails.name",
                    category: "$productDetails.category",
                    totalSales: 1,
                    totalQuantity: 1
                }
            },
            {
                $sort: { totalSales: -1 }
            }
        ]);

        // Separate top-selling and least-selling products
        const topSellingProducts = salesData.slice(0, 10);
        const leastSellingProducts = salesData.slice(-10);

        const combinedReport = [
            ...topSellingProducts,
            ...leastSellingProducts
        ];

        res.json({
            message: 'Top 10 and least 10 selling products report generated successfully',
            topSelling: topSellingProducts,
            leastSelling: leastSellingProducts,
            combined: combinedReport
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

router.get('/inventory-movement', async (req, res) => {
    const { startDate, endDate } = req.query;

    try {
        let salesQuery = {};
        if (startDate && endDate) {
            salesQuery.saleDate = { $gte: new Date(startDate), $lte: new Date(endDate) };
        }

        // Slow-Moving Inventory Criteria (e.g., low sales)
        const slowMovingInventory = await Sales.aggregate([
            { $match: salesQuery },
            {
                $group: {
                    _id: "$productId",
                    totalSales: { $sum: "$totalSaleAmount" },
                    totalQuantitySold: { $sum: "$quantitySold" }
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
                    totalSales: 1,
                    totalQuantitySold: 1
                }
            },
            { $match: { totalQuantitySold: { $lt: 3 } } },  // Slow-moving criteria
            { $sort: { totalSales: 1 } } // Sort by lowest sales
        ]);

        // Fast-Moving Inventory Criteria (e.g., high sales)
        const fastMovingInventory = await Sales.aggregate([
            { $match: salesQuery },
            {
                $group: {
                    _id: "$productId",
                    totalSales: { $sum: "$totalSaleAmount" },
                    totalQuantitySold: { $sum: "$quantitySold" }
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
                    totalSales: 1,
                    totalQuantitySold: 1
                }
            },
            { $match: { totalQuantitySold: { $gte: 3 } } },  // Fast-moving criteria
            { $sort: { totalSales: -1 } } // Sort by highest sales
        ]);

        res.json({
            message: 'Inventory movement report generated successfully',
            slowMoving: slowMovingInventory,
            fastMoving: fastMovingInventory
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

router.get('/sales-and-stock-by-category', async (req, res) => {
    const { startDate, endDate } = req.query;

    try {
        let salesQuery = {};
        if (startDate && endDate) {
            salesQuery.saleDate = { $gte: new Date(startDate), $lte: new Date(endDate) };
        }

        // Sales by Category/Subcategory
        const salesByCategory = await Sales.aggregate([
            { $match: salesQuery },
            {
                $group: {
                    _id: "$productId",
                    totalSales: { $sum: "$totalSaleAmount" },
                    totalQuantitySold: { $sum: "$quantitySold" }
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
                $group: {
                    _id: { category: "$productDetails.category", subCategory: "$productDetails.subCategory" },
                    totalSales: { $sum: "$totalSales" },
                    totalQuantitySold: { $sum: "$totalQuantitySold" }
                }
            },
            {
                $project: {
                    category: "$_id.category",
                    subCategory: "$_id.subCategory",
                    totalSales: 1,
                    totalQuantitySold: 1
                }
            }
        ]);

        // Sales and Stock by Category
        const salesAndStockByCategory = await Stock.aggregate([
            {
                $lookup: {
                    from: "sales",
                    localField: "productId",
                    foreignField: "productId",
                    as: "salesData"
                }
            },
            {
                $unwind: {
                    path: "$salesData",
                    preserveNullAndEmptyArrays: true // Keep stock data even if there are no sales
                }
            },
            {
                $group: {
                    _id: "$productId",
                    totalStock: { $sum: "$stock" },
                    totalSales: { $sum: "$salesData.totalSaleAmount" },
                    totalQuantitySold: { $sum: "$salesData.quantitySold" }
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
                $group: {
                    _id: "$productDetails.category",
                    totalStock: { $sum: "$totalStock" },
                    totalSales: { $sum: "$totalSales" },
                    totalQuantitySold: { $sum: "$totalQuantitySold" }
                }
            },
            {
                $project: {
                    category: "$_id",
                    totalStock: 1,
                    totalSales: 1,
                    totalQuantitySold: 1
                }
            }
        ]);

        res.json({
            message: 'Sales and stock by category report generated successfully',
            salesByCategory: salesByCategory,
            salesAndStockByCategory: salesAndStockByCategory
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

router.get('/buyer-demographics', async (req, res) => {
    const { startDate, endDate } = req.query;

    try {
        let salesQuery = {};
        if (startDate && endDate) {
            salesQuery.saleDate = { $gte: new Date(startDate), $lte: new Date(endDate) };
        }

        const ageGroups = [
            { range: "0-18", min: 0, max: 18 },
            { range: "19-35", min: 19, max: 35 },
            { range: "36-50", min: 36, max: 50 },
            { range: "51+", min: 51, max: 150 }
        ];

        const salesData = await Sales.aggregate([
            { $match: salesQuery },
            {
                $addFields: {
                    ageGroup: {
                        $switch: {
                            branches: ageGroups.map(({ range, min, max }) => ({
                                case: { $and: [{ $gte: ["$buyerDetails.age", min] }, { $lte: ["$buyerDetails.age", max] }] },
                                then: range
                            })),
                            default: "Unknown"
                        }
                    }
                }
            },
            {
                $group: {
                    _id: {
                        ageGroup: "$ageGroup",
                        gender: "$buyerDetails.gender",
                        productId: "$productId"
                    },
                    totalSales: { $sum: "$totalSaleAmount" },
                    totalQuantitySold: { $sum: "$quantitySold" }
                }
            },
            {
                $lookup: {
                    from: "products",
                    localField: "_id.productId",
                    foreignField: "productId",
                    as: "productDetails"
                }
            },
            { $unwind: "$productDetails" },
            {
                $project: {
                    ageGroup: "$_id.ageGroup",
                    gender: "$_id.gender",
                    productId: "$_id.productId",
                    productName: "$productDetails.name",
                    totalSales: 1,
                    totalQuantitySold: 1
                }
            }
        ]);

        const result = ageGroups.reduce((acc, { range }) => {
            acc[range] = {
                male: [],
                female: [],
                other: []
            };
            return acc;
        }, {});

        salesData.forEach(({ ageGroup, gender, productName, totalSales, totalQuantitySold }) => {
            if (result[ageGroup] && result[ageGroup][gender]) {
                result[ageGroup][gender].push({ productName, totalSales, totalQuantitySold });
            }
        });

        for (const group in result) {
            for (const gender in result[group]) {
                result[group][gender] = result[group][gender]
                    .sort((a, b) => b.totalSales - a.totalSales)
                    .slice(0, 5); // Top 5 products
            }
        }

        res.json({
            message: 'Detailed buyer demographics with top product preferences generated successfully',
            data: result
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});


router.get('/dashboard-insights', async (req, res) => {
    const { startDate, endDate } = req.query;

    try {
        let salesQuery = {};
        if (startDate && endDate) {
            salesQuery.saleDate = { $gte: new Date(startDate), $lte: new Date(endDate) };
        }

        const salesInsights = await Sales.aggregate([
            { $match: salesQuery },
            {
                $group: {
                    _id: "$productId",
                    totalRevenue: { $sum: "$totalSaleAmount" },
                    totalSalesCount: { $sum: 1 },
                    averageSaleAmount: { $avg: "$totalSaleAmount" },
                    maxSaleAmount: { $max: "$totalSaleAmount" },
                    totalQuantitySold: { $sum: "$quantitySold" }
                }
            },
            {
                $lookup: {
                    from: "stocks",
                    localField: "_id",
                    foreignField: "productId",
                    as: "stockDetails"
                }
            },
            {
                $unwind: {
                    path: "$stockDetails",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $addFields: {
                    remainingStock: {
                        $subtract: ["$stockDetails.stock", "$totalQuantitySold"]
                    }
                }
            },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: "$totalRevenue" },
                    totalSalesCount: { $sum: "$totalSalesCount" },
                    averageSaleAmount: { $avg: "$averageSaleAmount" },
                    maxSaleAmount: { $max: "$maxSaleAmount" },
                    totalQuantitySold: { $sum: "$totalQuantitySold" },
                    totalRemainingStock: { $sum: "$remainingStock" }
                }
            },
            {
                $project: {
                    _id: 0,
                    totalRevenue: 1,
                    totalSalesCount: 1,
                    averageSaleAmount: 1,
                    maxSaleAmount: 1,
                    totalQuantitySold: 1,
                    totalRemainingStock: 1
                }
            }
        ]);

        res.json({
            message: 'Sales revenue and insights report generated successfully',
            data: salesInsights.length > 0 ? salesInsights[0] : {}
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});


router.get('/sales-per-unit-analysis', async (req, res) => {
    const { startDate, endDate } = req.query;

    try {
        let salesQuery = {};
        if (startDate && endDate) {
            salesQuery.saleDate = { $gte: new Date(startDate), $lte: new Date(endDate) };
        }

        const salesData = await Sales.aggregate([
            { $match: salesQuery },
            {
                $group: {
                    _id: "$productId",
                    totalSales: { $sum: "$totalSaleAmount" },
                    totalQuantitySold: { $sum: "$quantitySold" }
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
            {
                $lookup: {
                    from: "stocks",
                    localField: "_id",
                    foreignField: "productId",
                    as: "stockDetails"
                }
            },
            { $unwind: "$productDetails" },
            { $unwind: "$stockDetails" },
            {
                $addFields: {
                    remainingStock: "$stockDetails.stock",
                    initialStock: { $add: ["$totalQuantitySold", "$stockDetails.stock"] }
                }
            },
            {
                $project: {
                    productId: "$_id",
                    productName: "$productDetails.name",
                    totalSales: 1,
                    totalQuantitySold: 1,
                    salesPerUnit: { $divide: ["$totalSales", "$totalQuantitySold"] },
                    pricePerUnit: "$stockDetails.price",
                    initialStock: 1,
                    remainingStock: 1
                }
            }
        ]);

        res.json({
            message: 'Sales per unit analysis generated successfully',
            data: salesData
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});



// Get brand analysis report
router.get('/brands', async (req, res) => {
    try {
        const brands = await Product.distinct('subCategory');
        
        res.json({
            success: true,
            message: 'Brands fetched successfully',
            data: brands.filter(brand => brand && brand.trim() !== '') // Filter out empty values
        });
    } catch (err) {
        console.error('Error fetching brands:', err);
        res.status(500).json({
            success: false,
            message: 'Error fetching brands',
            error: err.message
        });
    }
});

router.get('/subcategory-analysis-report', async (req, res) => {
    const { startDate, endDate, brand } = req.query;

    try {
        // Base match query
        let matchQuery = {};
        
        // Add date filter if provided
        if (startDate && endDate) {
            matchQuery.saleDate = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        // Add brand/subcategory filter if provided
        if (brand) {
            // First, get all product IDs for the selected brand
            const products = await Product.find({ subCategory: brand }, { productId: 1 });
            const productIds = products.map(p => p.productId);
            matchQuery.productId = { $in: productIds };
        }

        // 1. Sales by Brand/Subcategory
        const salesBySubcategory = await Sales.aggregate([
            { $match: matchQuery },
            {
                $lookup: {
                    from: 'products',
                    localField: 'productId',
                    foreignField: 'productId',
                    as: 'product'
                }
            },
            { $unwind: '$product' },
            {
                $group: {
                    _id: '$product.subCategory',
                    totalSales: { $sum: '$totalSaleAmount' },
                    totalQuantitySold: { $sum: '$quantitySold' },
                    averageOrderValue: { $avg: '$totalSaleAmount' }
                }
            },
            {
                $project: {
                    subCategory: '$_id',
                    totalSales: 1,
                    totalQuantitySold: 1,
                    averageOrderValue: { $round: ['$averageOrderValue', 2] }
                }
            }
        ]);

        // 2. Products Performance
        const productsBySubcategory = await Sales.aggregate([
            { $match: matchQuery },
            {
                $lookup: {
                    from: 'products',
                    localField: 'productId',
                    foreignField: 'productId',
                    as: 'product'
                }
            },
            { $unwind: '$product' },
            {
                $group: {
                    _id: {
                        productId: '$productId',
                        productName: '$product.name',
                        subCategory: '$product.subCategory'
                    },
                    totalSales: { $sum: '$totalSaleAmount' },
                    totalQuantitySold: { $sum: '$quantitySold' },
                    averagePrice: { $avg: '$salePrice' }
                }
            },
            {
                $project: {
                    productId: '$_id.productId',
                    productName: '$_id.productName',
                    subCategory: '$_id.subCategory',
                    totalSales: 1,
                    totalQuantitySold: 1,
                    averagePrice: { $round: ['$averagePrice', 2] }
                }
            },
            { $sort: { totalSales: -1 } }
        ]);

        // 3. Customer Demographics
        const customerDemographicsBySubcategory = await Sales.aggregate([
            { $match: matchQuery },
            {
                $lookup: {
                    from: 'products',
                    localField: 'productId',
                    foreignField: 'productId',
                    as: 'product'
                }
            },
            { $unwind: '$product' },
            {
                $group: {
                    _id: {
                        subCategory: '$product.subCategory',
                        gender: '$buyerDetails.gender',
                        ageGroup: {
                            $switch: {
                                branches: [
                                    { case: { $lte: ['$buyerDetails.age', 25] }, then: '18-25' },
                                    { case: { $lte: ['$buyerDetails.age', 35] }, then: '26-35' },
                                    { case: { $lte: ['$buyerDetails.age', 45] }, then: '36-45' },
                                    { case: { $lte: ['$buyerDetails.age', 55] }, then: '46-55' }
                                ],
                                default: '55+'
                            }
                        }
                    },
                    totalSales: { $sum: '$totalSaleAmount' },
                    totalQuantitySold: { $sum: '$quantitySold' },
                    customerCount: { $addToSet: '$buyerDetails.name' }
                }
            },
            {
                $project: {
                    subCategory: '$_id.subCategory',
                    gender: '$_id.gender',
                    ageGroup: '$_id.ageGroup',
                    totalSales: 1,
                    totalQuantitySold: 1,
                    customerCount: { $size: '$customerCount' }
                }
            }
        ]);

        // 4. Sales Trends (Monthly)
        const salesTrendsBySubcategory = await Sales.aggregate([
            { $match: matchQuery },
            {
                $lookup: {
                    from: 'products',
                    localField: 'productId',
                    foreignField: 'productId',
                    as: 'product'
                }
            },
            { $unwind: '$product' },
            {
                $group: {
                    _id: {
                        subCategory: '$product.subCategory',
                        year: { $year: '$saleDate' },
                        month: { $month: '$saleDate' }
                    },
                    totalSales: { $sum: '$totalSaleAmount' },
                    totalQuantitySold: { $sum: '$quantitySold' },
                    averageOrderValue: { $avg: '$totalSaleAmount' }
                }
            },
            {
                $project: {
                    subCategory: '$_id.subCategory',
                    year: '$_id.year',
                    month: '$_id.month',
                    totalSales: 1,
                    totalQuantitySold: 1,
                    averageOrderValue: { $round: ['$averageOrderValue', 2] }
                }
            },
            { $sort: { year: 1, month: 1 } }
        ]);

        // 5. Calculate month-over-month growth
        const calculateGrowth = (currentPeriod, previousPeriod) => {
            if (!previousPeriod || previousPeriod.totalSales === 0) return 0;
            return ((currentPeriod.totalSales - previousPeriod.totalSales) / previousPeriod.totalSales) * 100;
        };

        const trends = salesTrendsBySubcategory.map((period, index, array) => ({
            ...period,
            growth: calculateGrowth(period, array[index - 1])
        }));

        res.json({
            success: true,
            message: 'Brand analysis report generated successfully',
            data: {
                salesBySubcategory,
                productsBySubcategory,
                customerDemographicsBySubcategory,
                salesTrendsBySubcategory: trends
            }
        });

    } catch (err) {
        console.error('Error generating brand analysis report:', err);
        res.status(500).json({
            success: false,
            message: 'Error generating brand analysis report',
            error: err.message
        });
    }
});

module.exports = router;