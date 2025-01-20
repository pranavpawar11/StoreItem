const express = require('express');
const router = express.Router();
const ExpiryAlert = require('../models/ExpiryAlertSchema');
const Stock = require('../models/StockSchema')
const Counter = require('../models/CounterSchema');
const Product = require('../models/ProductSchema');

// Function to get the next sequence number
const getNextSequence = async (name) => {
    try {
        const counter = await Counter.findOneAndUpdate(
            { name },
            { $inc: { seq: 1 } },
            { new: true, upsert: true }
        );
        return counter.seq; // Return the updated sequence value
    } catch (err) {
        console.error('Error getting next sequence:', err.message);
        throw new Error('Error getting next sequence');
    }
};

router.get('/checkallstocksforexpiry', async (req, res) => {
    try {
        const stocks = await Stock.find();  // Fetch all stocks
        const today = new Date();
        const alerts = [];

        for (const stock of stocks) {
            const { _id: stockId, expiryDate, productId } = stock;

            if (!expiryDate) continue;  // Skip stock without expiry date

            const daysUntilExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
            let alertLevel = 'green';
            if (daysUntilExpiry <= 7) alertLevel = 'red';
            else if (daysUntilExpiry <= 15) alertLevel = 'yellow';

            // Create or update expiry alert
            const alert = await ExpiryAlert.findOneAndUpdate(
                { stockId },  // Check if alert already exists for this stockId
                {
                    stockId,
                    productId,  // Using productId from stock, which is a string
                    alertLevel,
                    expiryDate,
                    notificationStatus: 'pending',
                    alertGeneratedOn: today
                },
                { upsert: true, new: true }  // If no alert exists, create a new one
            );

            alerts.push(alert);
        }

        res.json({ message: 'Expiry alerts generated successfully', data: alerts });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

router.get('/fetchnotifications', async (req, res) => {
    const { alertLevel, notificationStatus } = req.query;

    try {
        const query = {};

        if (alertLevel) {
            query.alertLevel = alertLevel;  // Filter by alertLevel if provided
        }

        if (notificationStatus) {
            query.notificationStatus = notificationStatus;  // Filter by notificationStatus if provided
        }

        // Fetch alerts based on the query
        const notifications = await ExpiryAlert.find(query)
            .select('productId alertLevel notificationStatus alertGeneratedOn');  // Selecting fields to include in response

        // Manually populate product details based on productId
        const notificationsWithProductDetails = await Promise.all(
            notifications.map(async (alert) => {
                const product = await Product.findOne({ productId: alert.productId });  // Manually fetching Product by productId
                return { ...alert.toObject(), product };  // Add product details to the alert object
            })
        );

        res.json({ message: 'Notifications fetched successfully', data: notificationsWithProductDetails });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

router.put('/acknowledgeNotification/:id', async (req, res) => {
    try {
        const alertId = req.params.id;
        
        // Find the expiry alert by ID and update notificationStatus to 'acknowledged'
        const updatedAlert = await ExpiryAlert.findByIdAndUpdate(
            alertId,
            { notificationStatus: 'acknowledged' },
            { new: true }  // Return the updated alert
        );

        if (!updatedAlert) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        res.json({ message: 'Notification acknowledged successfully', data: updatedAlert });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

router.get('/fetchnotificationsByProduct/:productId', async (req, res) => {
    try {
        const productId = req.params.productId;

        // Fetch all alerts related to a specific product
        const notifications = await ExpiryAlert.find({ productId })
            .select('productId alertLevel notificationStatus alertGeneratedOn');  // Selecting fields to include in response

        // Manually populate product details based on productId
        const notificationsWithProductDetails = await Promise.all(
            notifications.map(async (alert) => {
                const product = await Product.findOne({ productId: alert.productId });
                return { ...alert.toObject(), product };  // Add product details to the alert object
            })
        );

        res.json({ message: 'Notifications fetched successfully for the product', data: notificationsWithProductDetails });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

router.delete('/deleteNotification/:id', async (req, res) => {
    try {
        const alertId = req.params.id;

        // Delete the alert by ID
        const deletedAlert = await ExpiryAlert.findByIdAndDelete(alertId);

        if (!deletedAlert) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        res.json({ message: 'Notification deleted successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});


module.exports = router;
