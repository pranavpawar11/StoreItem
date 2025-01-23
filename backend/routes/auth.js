const express = require('express');
const router = express.Router();
const User = require('../models/UserSchema');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const fetchuser = require('../middlewear/fetchuser');
const bcrypt = require("bcryptjs");

const JWT_SECRET = "thisIsaJWTwebtoken1231";

// Route 1: Create a new user without login
router.post('/createuser', [
    body('name', 'Enter a valid name').isLength({ min: 3 }),
    body('email', 'Enter a valid email').isEmail(),
    body('password', 'Password must be at least 5 characters').isLength({ min: 5 }),
], async (req, res) => {
    const result = validationResult(req);
    let success = false;

    // Handle validation errors
    if (!result.isEmpty()) {
        return res.status(400).send({ errors: result.array() });
    }

    try {
        // Check if email already exists
        let user = await User.findOne({ email: req.body.email });

        if (user) {
            return res.status(400).json({ success, error: "Email already taken" });
        }

        const salt = await bcrypt.genSalt(10);
        const secPass = await bcrypt.hash(req.body.password, salt);

        // Create a new user with default role and permissions
        const data = {
            user: {
                name: req.body.name,
                email: req.body.email,
                role: "admin", // Default role
                permissions: [ // Default permissions
                    "viewProducts",
                    "addProducts",
                    "viewReports",
                    "editProducts",
                    "deleteProducts",
                    "updateModels"
                ]
            }
        };

        user = await User.create({
            name: req.body.name,
            password: secPass,
            email: req.body.email,
            role: data.user.role,
            permissions: data.user.permissions
        });

        const authToken = jwt.sign({ user: { id: user.id } }, JWT_SECRET);
        success = true;
        res.json({ success, authToken });
    } catch (err) {
        console.log(err.message);
        res.status(500).send("Some error occurred");
    }
});

// Route 2: Log in the user with correct details
router.post('/login', [
    body('email', 'Enter a valid email').isEmail(),
    body('password', 'Password cannot be blank').exists(),
], async (req, res) => {
    let success = false;
    const result = validationResult(req);

    // Handle validation errors
    if (!result.isEmpty()) {
        return res.status(400).send({ errors: result.array() });
    }

    const { email, password } = req.body;
    try {
        // Check if user exists
        let user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ success, error: "Please try with correct credentials" });
        }

        const passCompare = await bcrypt.compare(password, user.password);
        if (!passCompare) {
            return res.status(400).json({ success, error: "Please try with correct credentials" });
        }

        const data = {
            user: {
                id: user.id
            }
        };
        const authToken = jwt.sign(data, JWT_SECRET);
        success = true;
        res.json({ success, authToken });
    } catch (err) {
        console.log(err.message);
        res.status(500).send("Some error occurred while logging in");
    }
});

// Route 3: Fetch user details
router.get('/getuser', fetchuser, async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId).select("-password");
        res.send({
            success: true,
            data: user
        });
    } catch (err) {
        console.log(err.message);
        res.status(500).send("Internal Error");
    }
});

// Route 4: Reset password
router.post('/resetpassword', [
    body('email', 'Enter a valid email').isEmail(),
    body('password', 'Password cannot be blank').exists(),
], async (req, res) => {
    let success = false;
    const result = validationResult(req);

    // Handle validation errors
    if (!result.isEmpty()) {
        return res.status(400).json({ errors: result.array() });
    }

    const { email, password } = req.body;

    try {
        // Find user by email
        let user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ success, error: "Please try with correct credentials" });
        }

        // Hash the new password
        const salt = await bcrypt.genSalt(10);
        const secPass = await bcrypt.hash(password, salt);

        // Update the user's password
        user.password = secPass;
        await user.save();

        const data = {
            user: {
                id: user.id
            }
        };
        const authToken = jwt.sign(data, JWT_SECRET);
        success = true;

        res.json({ success, authToken });
    } catch (err) {
        console.log(err.message);
        res.status(500).send("Some error occurred while resetting the password");
    }
});

module.exports = router;
