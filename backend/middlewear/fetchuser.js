const jwt = require('jsonwebtoken');

const JWT_SECRET = "thisIsaJWTwebtoken1231"

const fetchuser = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ success: false, error: "Authentication failed" });
    }

    try {
        const data = jwt.verify(token, JWT_SECRET);
        req.user = data.user;
        next();
    } catch (err) {
        return res.status(401).json({ success: false, error: "Invalid token" });
    }
};
module.exports = fetchuser;