import jwt from 'jsonwebtoken';
import { AppError } from './error.middleware.js';

/**
 * Basic authentication check
 */
export const protect = async (req, res, next) => {
    try {
        let token;

        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        } else if (req.headers['x-auth-token']) {
            token = req.headers['x-auth-token'];
        } else if (req.cookies && req.cookies.accessToken) {
            token = req.cookies.accessToken;
        }

        if (!token) {
            return next(new AppError('No industrial access token found', 401));
        }

        // [DEMO BYPASS]
        if (token === 'demo-token' || token === 'demo-token-consumer') {
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
        if (err.name === 'TokenExpiredError') {
            return next(new AppError('Access token expired', 401));
        }
        return next(new AppError('Unauthorized access', 401));
    }
};

/**
 * Role-Based Access Control
 * @param  {...string} roles 
 */
export const restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new AppError('You do not have permission to perform this operation', 403));
        }
        next();
    };
};
