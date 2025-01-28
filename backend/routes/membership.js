const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { Plan, Member, Stats, CounterMembership } = require('../models/MembershipSchema');
// Helper function to get next sequence
async function getNextSequence(sequenceName) {
    const counter = await CounterMembership.findByIdAndUpdate(
        sequenceName,
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
    );
    return counter.seq;
}

// Get dashboard stats
router.get('/stats', async (req, res) => {
    try {
        let stats = await Stats.findOne().sort({ lastUpdated: -1 });
        
        if (!stats || Date.now() - stats.lastUpdated > 3600000) { // Refresh if older than 1 hour
            const activePlans = await Plan.countDocuments();
            const totalMembers = await Member.countDocuments({ status: 'Active' });
            const revenue = await calculateRevenue();
            const upcomingRenewals = await Member.countDocuments({
                renewalDate: {
                    $gte: new Date(),
                    $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Next 7 days
                }
            });

            stats = await Stats.findOneAndUpdate(
                {},
                { activePlans, totalMembers, revenue, upcomingRenewals },
                { new: true, upsert: true }
            );
        }

        res.json(stats);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// Create new plan
router.post('/plans', [
    body('name').trim().notEmpty().withMessage('Plan name is required'),
    body('price').isNumeric().withMessage('Valid price is required'),
    body('features').isArray().withMessage('Features must be an array')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { name, price, features } = req.body;
        const planId = await getNextSequence('planId');

        const plan = new Plan({
            planId,
            name,
            price,
            features
        });

        await plan.save();
        res.status(201).json(plan);
    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({ error: 'Plan name already exists' });
        }
        console.error(err);
        res.status(500).send('Server error');
    }
});

// Get all plans
router.get('/plans', async (req, res) => {
    try {
        const plans = await Plan.find().sort({ price: 1 });
        res.json(plans);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// Create new member
router.post('/members', [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('planId').isNumeric().withMessage('Valid plan ID is required'),
    body('renewalDate').isISO8601().withMessage('Valid renewal date is required')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { name, email, planId, renewalDate } = req.body;
        
        // Verify plan exists
        const plan = await Plan.findOne({ planId });
        if (!plan) {
            return res.status(400).json({ error: 'Invalid plan ID' });
        }

        const memberId = await getNextSequence('memberId');

        const member = new Member({
            memberId,
            name,
            email,
            planId,
            renewalDate
        });

        await member.save();
        
        // Update plan subscribers count
        await Plan.findOneAndUpdate(
            { planId },
            { $inc: { subscribers: 1 } }
        );

        res.status(201).json(member);
    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({ error: 'Email already exists' });
        }
        console.error(err);
        res.status(500).send('Server error');
    }
});

// Get members with search and filtering
router.get('/members', async (req, res) => {
    try {
        const { search, status, plan } = req.query;
        let query = {};

        if (search) {
            query.$or = [
                { name: new RegExp(search, 'i') },
                { email: new RegExp(search, 'i') }
            ];
        }

        if (status) {
            query.status = status;
        }

        if (plan) {
            query.planId = plan;
        }

        const members = await Member.find(query).sort({ createdAt: -1 });
        res.json(members);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// Update member status
router.patch('/members/:memberId/status', [
    body('status').isIn(['Active', 'Suspended', 'Cancelled']).withMessage('Invalid status')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { status } = req.body;
        const member = await Member.findOneAndUpdate(
            { memberId: req.params.memberId },
            { status, updatedAt: Date.now() },
            { new: true }
        );

        if (!member) {
            return res.status(404).json({ error: 'Member not found' });
        }

        res.json(member);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// Delete member
router.delete('/members/:memberId', async (req, res) => {
    try {
        const member = await Member.findOne({ memberId: req.params.memberId });
        if (!member) {
            return res.status(404).json({ error: 'Member not found' });
        }

        // Decrease plan subscribers count
        await Plan.findOneAndUpdate(
            { planId: member.planId },
            { $inc: { subscribers: -1 } }
        );

        await member.remove();
        res.json({ message: 'Member deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// Helper function to calculate total revenue
async function calculateRevenue() {
    const members = await Member.find({ status: 'Active' });
    const plans = await Plan.find();
    const planPriceMap = plans.reduce((acc, plan) => {
        acc[plan.planId] = plan.price;
        return acc;
    }, {});

    return members.reduce((total, member) => {
        return total + (planPriceMap[member.planId] || 0);
    }, 0);
}

module.exports = router;