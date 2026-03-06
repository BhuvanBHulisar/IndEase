import jwt from 'jsonwebtoken';
import crypto from 'crypto';

/**
 * Generate Access Token
 * @param {Object} user 
 * @returns {string}
 */
export const generateAccessToken = (user) => {
    return jwt.sign(
        { id: user.id || user.user_id, email: user.email, role: user.role },
        process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET,
        { expiresIn: '1h' }
    );
};

/**
 * Generate Refresh Token
 * @param {Object} user 
 * @returns {string}
 */
export const generateRefreshToken = (user) => {
    return jwt.sign(
        { id: user.id },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: '7d' }
    );
};

/**
 * Hash a token for storage
 * @param {string} token 
 * @returns {string}
 */
export const hashToken = (token) => {
    return crypto.createHash('sha256').update(token).digest('hex');
};

/**
 * Generate a random verification token
 * @returns {string}
 */
export const generateRandomToken = () => {
    return crypto.randomBytes(32).toString('hex');
};
