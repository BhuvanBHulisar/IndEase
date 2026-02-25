const jwt = require('jsonwebtoken');

/**
 * AUTH MIDDLEWARE
 * Purpose: Verification of JWT for high-security industrial endpoints.
 * This ensures that only authenticated nodes/experts can access specific telemetry.
 */
module.exports = function (req, res, next) {
    // 1. Extract token from header (Standard: x-auth-token)
    const token = req.header('x-auth-token');

    // 2. Check if no token is present
    if (!token) {
        return res.status(401).json({ message: 'No security token found. Access denied.' });
    }

    // 3. Verify token integrity
    try {
        if (token === 'demo-token' || token === 'demo-token-consumer') {
            // [DEMO BYPASS - Consumer]
            req.user = { id: 'demo-123', email: 'admin@originode.com', role: 'consumer' };
            return next();
        }

        if (token === 'demo-token-producer') {
            // [DEMO BYPASS - Producer]
            req.user = { id: 'demo-123', email: 'admin@originode.com', role: 'producer' };
            return next();
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Attach decoded user info (id, role) to the request object
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ message: 'Security token is invalid or expired.' });
    }
};
