const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');

// @desc    Register user
exports.signup = async (req, res) => {
    const { email, password, firstName, lastName, role } = req.body;

    try {
        // 1. Check if user already exists in nodes
        const userExists = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userExists.rows.length > 0) {
            return res.status(400).json({ message: 'Identity already registered in network' });
        }

        // 2. Hash security credentials
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 3. Insert into industrial ledger
        const newUser = await db.query(
            'INSERT INTO users (email, password_hash, first_name, last_name, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, email, role',
            [email, hashedPassword, firstName, lastName, role]
        );

        // 4. If producer, initialize their expert profile
        if (role === 'producer') {
            await db.query('INSERT INTO producer_profiles (user_id) VALUES ($1)', [newUser.rows[0].id]);
        }

        // 5. Generate Access Token (JWT)
        const token = jwt.sign(
            { id: newUser.rows[0].id, role: newUser.rows[0].role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(201).json({
            token,
            user: newUser.rows[0]
        });

    } catch (err) {
        console.error('[Auth] Signup failure:', err);
        res.status(500).json({ message: 'Internal operational failure' });
    }
};

// @desc    Login user
exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // 1. Locate identity in ledger
        const user = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        if (user.rows.length === 0) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // 2. Verify encrypted credentials
        const isMatch = await bcrypt.compare(password, user.rows[0].password_hash);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // 3. Generate secure access token
        const token = jwt.sign(
            { id: user.rows[0].id, role: user.rows[0].role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            token,
            user: {
                id: user.rows[0].id,
                email: user.rows[0].email,
                role: user.rows[0].role,
                firstName: user.rows[0].first_name,
                lastName: user.rows[0].last_name
            }
        });

    } catch (err) {
        console.error('[Auth] Login failure:', err);
        res.status(500).json({ message: 'Internal operational failure' });
    }
};

// @desc    Get current user
exports.getMe = async (req, res) => {
    try {
        const userId = req.user.id;

        // Fetch user from industrial ledger
        const userResult = await db.query(
            'SELECT id, email, first_name, last_name, role FROM users WHERE id = $1',
            [userId]
        );

        if (userResult.rows.length === 0) {
            // Check for demo user bypass
            if (userId === 'demo-123') {
                return res.json({
                    id: 'demo-123',
                    email: 'admin@originode.com',
                    role: 'consumer',
                    firstName: 'Demo',
                    lastName: 'User'
                });
            }
            return res.status(404).json({ message: 'User not found in network' });
        }

        const user = userResult.rows[0];
        res.json({
            id: user.id,
            email: user.email,
            role: user.role,
            firstName: user.first_name,
            lastName: user.last_name
        });
    } catch (err) {
        console.error('[Auth] Session retrieval failure:', err);
        res.status(500).json({ message: 'Session retrieval failure' });
    }
};
