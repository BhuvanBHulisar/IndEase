import jwt from 'jsonwebtoken';

export const adminOnly = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'Missing Authorization header' });

    const token = authHeader.split(' ')[1];
    try {
        const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
        if (payload.role !== 'admin') {
            return res.status(403).json({ error: 'Admin access required' });
        }
        req.user = payload; // attach for downstream use
        next();
    } catch (err) {
        console.error('Admin auth error:', err);
        return res.status(401).json({ error: 'Invalid token' });
    }
};
