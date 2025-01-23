const express = require('express');
const axios = require('axios');
const router = express.Router();

const Sales = require('../models/SalesSchema')
const Product = require('../models/ProductSchema');
const Stock = require('../models/StockSchema');
router.post('/train-stock-model', async (req, res) => {
    try {
        // Fetch sales data from the database
        const salesData = await Sales.find().lean();

        // Log sales data for debugging
        // console.log("Fetched Sales Data:", salesData);

        // Map the sales data into the required format
        const inputData = salesData.map(sale => ({
            productId: sale.productId,
            quantitySold: sale.quantitySold,
            saleDate: new Date(sale.saleDate).toISOString(), // Ensure saleDate is in correct format
            salePrice: sale.salePrice,  // Ensure salePrice is included
            buyerDetails: sale.buyerDetails  // Include buyerDetails if needed
        }));

        // Log input data before sending to Flask
        // console.log("Input Data for Training:", inputData);

        // Send the data to Flask for model training
        const response = await axios.post('http://localhost:8000/train-stock-model', { salesData: inputData });

        // Send back the response from Flask
        res.json({ message: 'Stock model training initiated', data: response.data });
    } catch (err) {
        // Log the error for debugging
        console.error('Error initiating training:', err.message);
        res.status(500).send('Training failed');
    }
});

router.post('/predict-stock', async (req, res) => {
    try {
        const inputData = req.body;  // Input: { productId: 1, salePrice: 25, saleDate: '2025-07-15', forecast_duration: 4 }
        const axios = require('axios');

        // Send request to Flask backend with forecast duration (in months)
        const response = await axios.post('http://localhost:8000/predict-stock', inputData);

        res.json({ message: 'Stock prediction successful', data: response.data });
    } catch (err) {
        console.error('Error predicting stock:', err.message);
        res.status(500).send('Prediction error');
    }
});

// Route to trigger training of the second model (v2)
// Route to trigger stock model training (v2)
router.post('/train-stock-model-v2', async (req, res) => {
    try {
        // Fetch sales data from MongoDB
        const salesData = await Sales.find().lean();

        // Transform the sales data into the format that the Flask app expects
        const inputData = salesData.map(sale => ({
            productId: sale.productId,
            quantitySold: sale.quantitySold,
            saleDate: new Date(sale.saleDate).toISOString(),  // Ensure date is in ISO string format
            totalSaleAmount: sale.totalSaleAmount
        }));

        // console.log("Sending data to Flask for training:", inputData);  // Debug log

        // Send the sales data to the Flask API for training the second model (SARIMA)
        const response = await axios.post('http://localhost:8000/train-stock-model-v2', {
            salesData: inputData
        });

        // Respond back with a success message and Flask's response
        res.json({
            message: 'Stock model v2 training initiated successfully',
            data: response.data
        });
    } catch (err) {
        console.error('Error initiating training for v2:', err.message);
        res.status(500).send('Training failed for v2');
    }
});

// Route to trigger stock prediction using the second model (v2)
router.post('/predict-stock-v2', async (req, res) => {
    try {
        const { productId, predictionLength, unit } = req.body;  // predictionLength in weeks, months, or days
        let predictionPeriodInDays;

        if (unit === 'weeks') {
            predictionPeriodInDays = predictionLength * 7; // Convert weeks to days
        } else if (unit === 'months') {
            predictionPeriodInDays = predictionLength * 30; // Approximate 30 days per month
        } else {
            predictionPeriodInDays = predictionLength; // Already in days
        }

        const inputData = {
            productId,
            predictionLength: predictionPeriodInDays,
            salesData: req.body.salesData // Sales data provided
        };

        const response = await axios.post('http://localhost:8000/predict-stock-v2', inputData);

        res.json({
            message: 'Stock prediction for v2 successful',
            data: response.data
        });
    } catch (err) {
        console.error('Error predicting stock for v2:', err.message);
        res.status(500).send('Prediction error for v2');
    }
});


router.post('/predict-stock-v3', async (req, res) => {
    try {
        const { productId, predictionLength, periodType } = req.body;  // periodType can be 'week' or 'month'

        // Fetch sales data for the given productId
        const salesData = await Sales.find({ productId }).lean();
        const aggregatedData = aggregateSales(salesData, periodType);

        let predictions = [];
        if (predictionLength === 'SMA') {
            predictions = simpleMovingAverage(aggregatedData, 4);  // Example with 4-period moving average
        } else if (predictionLength === 'ES') {
            predictions = exponentialSmoothing(aggregatedData, 0.3);  // Example with alpha = 0.3 for exponential smoothing
        }

        res.json({
            message: 'Stock prediction for v3 successful',
            data: predictions
        });
    } catch (err) {
        console.error('Error predicting stock for v3:', err.message);
        res.status(500).send('Prediction error for v3');
    }
});

// Exponential Smoothing prediction function
function exponentialSmoothing(data, alpha) {
    let smoothedData = [];
    let smoothedValue = data[0].averageSales;  // Initial value is the first data point

    // Apply exponential smoothing formula
    for (let i = 0; i < data.length; i++) {
        smoothedValue = alpha * data[i].averageSales + (1 - alpha) * smoothedValue;
        smoothedData.push({ period: data[i].period, smoothedValue });
    }
    return smoothedData;
}

// Simple Moving Average (SMA) prediction function
function simpleMovingAverage(data, period) {
    const predictions = [];
    for (let i = period; i < data.length; i++) {
        const avgSales = data.slice(i - period, i).reduce((sum, item) => sum + item.averageSales, 0) / period;
        predictions.push({ period: data[i].period, predictedSales: avgSales });
    }
    return predictions;
}

// Function to aggregate sales data by week or month
function aggregateSales(salesData, periodType) {
    // Initialize aggregation array
    const aggregatedData = [];

    // Group sales by week or month
    const groupedData = salesData.reduce((acc, sale) => {
        const saleDate = new Date(sale.saleDate);
        let periodKey;

        if (periodType === 'week') {
            // Group by week (using ISO week number)
            periodKey = `${saleDate.getFullYear()}-W${getWeekNumber(saleDate)}`;
        } else if (periodType === 'month') {
            // Group by month
            periodKey = `${saleDate.getFullYear()}-${saleDate.getMonth() + 1}`;
        }

        if (!acc[periodKey]) {
            acc[periodKey] = { totalSales: 0, count: 0 };
        }

        acc[periodKey].totalSales += sale.quantitySold;
        acc[periodKey].count += 1;

        return acc;
    }, {});

    // Convert the grouped data into an array
    for (const period in groupedData) {
        aggregatedData.push({
            period,
            totalSales: groupedData[period].totalSales,
            averageSales: groupedData[period].totalSales / groupedData[period].count
        });
    }

    return aggregatedData;
}

// Helper function to get ISO week number
function getWeekNumber(date) {
    const startDate = new Date(date.getFullYear(), 0, 1);
    const days = Math.floor((date - startDate) / (24 * 60 * 60 * 1000));
    return Math.ceil((days + 1) / 7);
}

// SMA Prediction: The model calculates the average sales over the previous periods (in this case, months) and returns it as the prediction for the next period.

// ES Prediction: The model uses Exponential Smoothing to predict the next period, giving more weight to recent sales data.




// Route to perform brand analysis
router.post('/brand-analysis', async (req, res) => {
    try {
        const { brandName, categoryName } = req.body; // Get the brand and category from the request body

        // Fetch sales data for the given brand and category
        const salesData = await Sales.aggregate([
            {
                $lookup: {
                    from: 'products',
                    localField: 'productId',
                    foreignField: 'productId',
                    as: 'productDetails'
                }
            },
            { $unwind: "$productDetails" },
            { $match: { 'productDetails.subCategory': brandName, 'productDetails.category': categoryName } },
            {
                $group: {
                    _id: '$productId',
                    totalRevenue: { $sum: '$totalSaleAmount' },
                    totalQuantitySold: { $sum: '$quantitySold' },
                    totalCost: { $sum: '$cost' },
                    productName: { $first: '$productDetails.name' }
                }
            },
            {
                $project: {
                    _id: 0,
                    productId: '$_id',
                    productName: 1,
                    totalRevenue: 1,
                    totalQuantitySold: 1,
                    totalCost: 1,
                    profitOrLoss: { $subtract: ['$totalRevenue', '$totalCost'] }
                }
            }
        ]);

        if (salesData.length === 0) {
            return res.status(404).json({
                message: 'No data found for the provided brand and category'
            });
        }

        // Calculate total revenue, total cost, total profit/loss
        const totalRevenue = salesData.reduce((acc, data) => acc + data.totalRevenue, 0);
        const totalCost = salesData.reduce((acc, data) => acc + data.totalCost, 0);
        const totalProfitOrLoss = totalRevenue - totalCost;
        const totalQuantitySold = salesData.reduce((acc, data) => acc + data.totalQuantitySold, 0);

        // Find the best-selling product
        const bestSellingProduct = salesData.reduce((best, current) => (current.totalQuantitySold > best.totalQuantitySold) ? current : best, salesData[0]);

        // Find the worst-selling product
        const worstSellingProduct = salesData.reduce((worst, current) => (current.totalQuantitySold < worst.totalQuantitySold) ? current : worst, salesData[0]);

        // Adding status to each product based on profit or loss
        salesData.forEach(data => {
            data.status = data.profitOrLoss > 0 ? 'Profit' : (data.profitOrLoss < 0 ? 'Loss' : 'Neutral');
        });

        return res.json({
            message: 'Brand analysis successful',
            data: {
                brand: brandName,
                category: categoryName,
                totalRevenue: totalRevenue,
                totalCost: totalCost,
                totalProfitOrLoss: totalProfitOrLoss,
                totalQuantitySold: totalQuantitySold,
                bestSellingProduct: bestSellingProduct,
                worstSellingProduct: worstSellingProduct,
                profitLossData: salesData
            }
        });

    } catch (err) {
        console.error('Error performing brand analysis:', err.message);
        res.status(500).json({ message: 'Error during brand analysis', error: err.message });
    }
});



module.exports = router;
