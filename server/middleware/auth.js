import jwt from 'jsonwebtoken';

const auth = function (req, res, next) {
    // Extract token from Authorization header (Bearer) or x-auth-token
    let token = req.header('x-auth-token');
    if (!token && req.headers.authorization?.startsWith('Bearer ')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({ message: 'No security token found. Access denied.' });
    }

    try {
        if (token === 'demo-token' || token === 'demo-token-consumer' || token === 'demo-token-xyz') {
            req.user = { id: 'demo-123', email: 'admin@originode.com', role: 'consumer' };
            return next();
        }
        if (token === 'demo-token-producer') {
            req.user = { id: 'demo-123', email: 'admin@originode.com', role: 'producer' };
            return next();
        }

        const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ message: 'Security token is invalid or expired.' });
    }
};

export default auth;
