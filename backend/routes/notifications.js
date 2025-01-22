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
        const newAlerts = []; // Track newly created alerts

        for (const stock of stocks) {
            const { _id: stockId, expiryDate, productId } = stock;

            if (!expiryDate) continue;  // Skip stock without expiry date

            const daysUntilExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
            let alertLevel = 'green';
            if (daysUntilExpiry <= 7) alertLevel = 'red';
            else if (daysUntilExpiry <= 15) alertLevel = 'yellow';

            // Check if an active alert already exists
            const existingAlert = await ExpiryAlert.findOne({
                stockId,
                notificationStatus: { $in: ['pending', 'acknowledged'] }
            });

            if (existingAlert) {
                // Update alert level if it changed
                if (existingAlert.alertLevel !== alertLevel) {
                    existingAlert.alertLevel = alertLevel;
                    await existingAlert.save();
                }
                alerts.push(existingAlert);
            } else {
                // Create new alert only if one doesn't exist
                const newAlert = await ExpiryAlert.create({
                    stockId,
                    productId,
                    alertLevel,
                    expiryDate,
                    notificationStatus: 'pending',
                    alertGeneratedOn: today
                });
                alerts.push(newAlert);
                newAlerts.push(newAlert);
            }
        }

        res.json({ 
            message: 'Expiry alerts processed successfully', 
            data: alerts,
            newAlertsCount: newAlerts.length,
            newAlerts 
        });
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

// Add this new route to your notifications router
router.get('/priorityAlerts', async (req, res) => {
    try {
        // First try to get urgent (red) alerts
        let alerts = await ExpiryAlert.aggregate([
            {
                $match: {
                    alertLevel: 'red',
                    notificationStatus: 'pending'
                }
            },
            {
                $sort: {
                    alertGeneratedOn: -1
                }
            },
            {
                $limit: 6
            }
        ]);

        // If we don't have 6 urgent alerts, get remaining alerts by priority
        if (alerts.length < 6) {
            const remainingCount = 6 - alerts.length;
            const additionalAlerts = await ExpiryAlert.aggregate([
                {
                    $match: {
                        $or: [
                            { alertLevel: 'yellow', notificationStatus: 'pending' },
                            { alertLevel: 'green', notificationStatus: 'pending' }
                        ]
                    }
                },
                {
                    $sort: {
                        alertLevel: -1,  // This will sort yellow before green
                        alertGeneratedOn: -1
                    }
                },
                {
                    $limit: remainingCount
                }
            ]);

            alerts = [...alerts, ...additionalAlerts];
        }

        // Populate product details
        const populatedAlerts = await Promise.all(
            alerts.map(async (alert) => {
                const product = await Product.findOne({ productId: alert.productId });
                return { ...alert, product };
            })
        );

        res.json({
            message: 'Priority alerts fetched successfully',
            data: populatedAlerts,
            urgentCount: alerts.filter(a => a.alertLevel === 'red').length
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});
module.exports = router;
