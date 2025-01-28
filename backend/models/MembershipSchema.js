const mongoose = require('mongoose');
const { Schema } = mongoose;

// Plan Schema
const PlanSchema = new Schema({
    planId: {
        type: Number,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true,
        unique: true
    },
    price: {
        type: Number,
        required: true
    },
    features: [{
        type: String,
        required: true
    }],
    subscribers: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Member Schema
const MemberSchema = new Schema({
    memberId: {
        type: Number,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    planId: {
        type: Number,
        required: true,
        ref: 'Plan'
    },
    status: {
        type: String,
        enum: ['Active', 'Suspended', 'Cancelled'],
        default: 'Active'
    },
    renewalDate: {
        type: Date,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Stats Schema (for caching dashboard statistics)
const StatsSchema = new Schema({
    activePlans: {
        type: Number,
        required: true
    },
    totalMembers: {
        type: Number,
        required: true
    },
    revenue: {
        type: Number,
        required: true
    },
    upcomingRenewals: {
        type: Number,
        required: true
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    }
});

// Counter Schema (for auto-incrementing IDs)
const CounterSchemaMember = new Schema({
    _id: {
        type: String,
        required: true
    },
    seq: {
        type: Number,
        default: 0
    }
});

const Plan = mongoose.model('Plan', PlanSchema);
const Member = mongoose.model('Member', MemberSchema);
const Stats = mongoose.model('Stats', StatsSchema);
const CounterMembership = mongoose.model('CounterMember', CounterSchemaMember);

module.exports = { Plan, Member, Stats ,CounterMembership};