import bcrypt from 'bcryptjs';
import db from '../config/db.js';
import { AppError } from '../middleware/error.middleware.js';
import { hashToken, generateRandomToken } from '../utils/token.util.js';
import { sendVerificationEmail, sendPasswordResetEmail } from '../utils/email.util.js';

/**
 * Service for handling complex authentication logic
 */
export const registerUser = async (userData) => {
    const { email, password, firstName, lastName, phone, birthDate, companyName, extraInfo, role } = userData;
    const normalizedEmail = email.toLowerCase();

    // 1. Check existing (Case Insensitive)
    const exists = await db.query('SELECT id FROM users WHERE LOWER(email) = $1 OR phone_number = $2', [normalizedEmail, phone]);
    if (exists.rows.length > 0) {
        throw new AppError('Email already registered', 400);
    }

    // 2. Hash credentials
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Insert into Industrial Ledger
    const newUser = await db.query(
        `INSERT INTO users 
        (email, password_hash, first_name, last_name, phone_number, birth_date, company_name, role) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
        RETURNING id, email, role`,
        [normalizedEmail, hashedPassword, firstName, lastName, phone, birthDate, companyName || extraInfo, role]
    );

    const user = newUser.rows[0];

    // 4. Verification Token
    const verificationToken = generateRandomToken();
    const hashedVT = hashToken(verificationToken);

    await db.query(
        'INSERT INTO verification_tokens (user_id, token_hash, type, expires_at) VALUES ($1, $2, $3, $4)',
        [user.id, hashedVT, 'email_verification', new Date(Date.now() + 24 * 60 * 60 * 1000)]
    );

    // 5. Send Verification Dispatch
    await sendVerificationEmail(normalizedEmail, verificationToken);

    return user;
};

export const verifyUserEmail = async (token) => {
    const hashedToken = hashToken(token);

    const result = await db.query(
        'SELECT * FROM verification_tokens WHERE token_hash = $1 AND type = $2 AND expires_at > NOW()',
        [hashedToken, 'email_verification']
    );

    if (result.rows.length === 0) {
        throw new AppError('Invalid or expired verification token', 400);
    }

    const userId = result.rows[0].user_id;

    await db.query('UPDATE users SET email_verified = TRUE WHERE id = $1', [userId]);
    await db.query('DELETE FROM verification_tokens WHERE id = $1', [result.rows[0].id]);

    return { message: 'Industrial identity verified' };
};

export const initiatePasswordReset = async (email) => {
    const normalizedEmail = email.toLowerCase();
    const userRes = await db.query('SELECT id FROM users WHERE LOWER(email) = $1', [normalizedEmail]);

    if (userRes.rows.length === 0) return; // Security silence

    const resetToken = generateRandomToken();
    const hashedRT = hashToken(resetToken);

    await db.query(
        'INSERT INTO verification_tokens (user_id, token_hash, type, expires_at) VALUES ($1, $2, $3, $4)',
        [userRes.rows[0].id, hashedRT, 'password_reset', new Date(Date.now() + 1 * 60 * 60 * 1000)]
    );

    await sendPasswordResetEmail(normalizedEmail, resetToken);
};

export const resetUserPassword = async (token, newPassword) => {
    const hashedToken = hashToken(token);

    const result = await db.query(
        'SELECT * FROM verification_tokens WHERE token_hash = $1 AND type = $2 AND expires_at > NOW()',
        [hashedToken, 'password_reset']
    );

    if (result.rows.length === 0) {
        throw new AppError('Invalid or expired reset token', 400);
    }

    const userId = result.rows[0].user_id;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await db.query('UPDATE users SET password_hash = $1 WHERE id = $2', [hashedPassword, userId]);
    await db.query('DELETE FROM verification_tokens WHERE id = $1', [result.rows[0].id]);
};
