import db from '../config/db.js';

// @desc    Get expert profile metadata
// @route   GET /api/profile
export const getProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const role = req.user.role;
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

        // Check for demo user bypass or failed DB fallback FIRST
        if (!uuidRegex.test(userId) || (req.user && req.user.email === 'admin@originode.com')) {
            return res.json({
                id: userId === 'demo-123' ? 'demo-123' : (req.user.id || 'demo-123'),
                email: 'admin@originode.com',
                first_name: 'Technical',
                last_name: 'Admin',
                role: role || 'admin',
                phone: '+91 98765 24210',
                dob: '1995-05-20',
                organization: 'OrigiNode Administration',
                location: 'Bengaluru, Karnataka',
                tax_id: '29AAACN0000Z1Z0',
                is_verified: true,
                photo_url: 'https://ui-avatars.com/api/?name=Admin&background=1e293b&color=fff',
                skills: role === 'producer' ? ['System Architecture', 'Database Management'] : []
            });
        }

        // 1. Get basic user info
        const userResult = await db.query(
            'SELECT id, email, first_name, last_name, phone, dob, photo_url, organization, location, tax_id, is_verified, role FROM users WHERE id = $1',
            [userId]
        );

        let user = userResult.rows.length > 0 ? userResult.rows[0] : null;

        // Fallback for admin email even if UUID was valid
        if (user && user.email === 'admin@originode.com') {
             // ... already handled by the first if block for demo-123, 
             // but if a real admin goes through UUID, we keep the original logic here if needed.
        }

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // 2. If expert, get specialized metadata
        let profile = {};
        if (role === 'producer') {
            const profileResult = await db.query(
                'SELECT * FROM producer_profiles WHERE user_id = $1',
                [userId]
            );

            // If profile doesn't exist yet, create a default one
            if (profileResult.rows.length === 0) {
                const newProfile = await db.query(
                    'INSERT INTO producer_profiles (user_id) VALUES ($1) RETURNING *',
                    [userId]
                );
                profile = newProfile.rows[0];
            } else {
                profile = profileResult.rows[0];
                // bank_account_number is the canonical column
                profile.bank_account_number = profile.bank_account_number || profile.account_number || '';
            }
        }

        res.json({
            ...user,
            ...profile
        });
    } catch (err) {
        console.error('[Profile] Fetch failure:', err);
        res.status(500).json({ message: 'Could not retrieve profile data' });
    }
};

// @desc    Update expert profile
// @route   PATCH /api/profile
export const updateProfile = async (req, res) => {
    const { 
        first_name, last_name, phone, dob, photo_url, organization, location, tax_id, 
        skills, service_radius, status, 
        bank_account_number, ifsc_code, account_holder_name 
    } = req.body;
    const userId = req.user.id;
    const role = req.user.role;

    // STEP 6 — Add Validation
    if (bank_account_number) {
        if (!/^[0-9]{9,18}$/.test(bank_account_number)) {
            return res.status(400).json({ message: "Account number must be 9–18 digits" });
        }
    }

    if (ifsc_code) {
        if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc_code)) {
            return res.status(400).json({ message: "Invalid IFSC code" });
        }
    }

    // Demo/admin bypass — no real DB row to update
    if (userId === 'demo-123' || req.user.email === 'admin@originode.com') {
        return res.json({ message: 'Profile updated successfully' });
    }

    try {
        const toNull = (val) => (val === '' ? null : val);

        // 1. Update basic user table (Including consumer fields)
        await db.query(
            `UPDATE users 
             SET first_name = COALESCE($1, first_name), 
                 last_name = COALESCE($2, last_name),
                 phone = COALESCE($3, phone),
                 dob = COALESCE($4, dob),
                 photo_url = COALESCE($5, photo_url),
                 organization = COALESCE($6, organization),
                 location = COALESCE($7, location),
                 tax_id = COALESCE($8, tax_id)
             WHERE id = $9`,
            [toNull(first_name), toNull(last_name), toNull(phone), toNull(dob), toNull(photo_url), toNull(organization), toNull(location), toNull(tax_id), userId]
        );

        // 2. Update producer_profiles if role is producer
        if (role === 'producer') {
            // Check if profile exists
            const profileCheck = await db.query('SELECT * FROM producer_profiles WHERE user_id = $1', [userId]);

            if (profileCheck.rows.length === 0) {
                // Create if missing
                await db.query(
                    'INSERT INTO producer_profiles (user_id, skills, service_radius, status) VALUES ($1, $2, $3, $4)',
                    [userId, skills || [], service_radius || 50, status || 'available']
                );
            } else {
                // Update existing
                await db.query(
                    `UPDATE producer_profiles 
                     SET skills = COALESCE($1, skills), 
                         service_radius = COALESCE($2, service_radius), 
                         status = COALESCE($3, status),
                         bank_account_number = COALESCE($4, bank_account_number),
                         account_number = COALESCE($4, account_number),
                         ifsc_code = COALESCE($5, ifsc_code),
                         account_holder_name = COALESCE($6, account_holder_name),
                         updated_at = CURRENT_TIMESTAMP
                     WHERE user_id = $7`,
                    [skills, service_radius, status, bank_account_number, ifsc_code, account_holder_name, userId]
                );
            }
        }

        res.json({ message: 'Profile updated successfully' });
    } catch (err) {
        // STEP 7 — Debugging & Logging
        console.error("Error:", err);
        res.status(500).json({ message: 'Failed to synchronize profile' });
    }
};

// @desc    Request Industrial Verification
// @route   PATCH /api/profile/verify
export const verifyProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

        if (!uuidRegex.test(userId)) {
            return res.json({ message: 'Verification successful (Demo Mode)' });
        }

        await db.query('UPDATE users SET is_verified = TRUE WHERE id = $1', [userId]);
        console.log(`[Verification] User ${userId} industrial identity verified.`);
        res.json({ message: 'Verification successful. Your industrial identity is now public.' });
    } catch (err) {
        res.status(500).json({ message: 'Verification gateway failure' });
    }
};
// @desc    Add a skill to expert profile
// @route   POST /api/profile/skills
export const addSkill = async (req, res) => {
    const { skill } = req.body;
    const userId = req.user.id;

    try {
        await db.query(
            'UPDATE producer_profiles SET skills = array_append(skills, $1) WHERE user_id = $2 AND NOT ($1 = ANY(skills))',
            [skill, userId]
        );
        res.json({ message: 'Skill added to arsenal' });
    } catch (err) {
        console.error('[Profile] Skill addition failure:', err);
        res.status(500).json({ message: 'Failed to update skill set' });
    }
};

// @desc    Remove a skill from expert profile
// @route   DELETE /api/profile/skills/:skill
export const removeSkill = async (req, res) => {
    const { skill } = req.params;
    const userId = req.user.id;

    try {
        await db.query(
            'UPDATE producer_profiles SET skills = array_remove(skills, $1) WHERE user_id = $2',
            [skill, userId]
        );
        res.json({ message: 'Skill decommissioned' });
    } catch (err) {
        console.error('[Profile] Skill removal failure:', err);
        res.status(500).json({ message: 'Failed to update skill set' });
    }
};

export const updateProfileData = async (req, res) => {
    try {
        const userId = req.user.id;
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        
        // Demo/admin bypass
        if (!uuidRegex.test(userId) || req.user.email === 'admin@originode.com') {
            return res.json({ success: true, user: req.user });
        }
        
        const { first_name, last_name, company, phone, city, state, pincode } = req.body;
        
        // Use direct assignment (not COALESCE) so users can clear fields
        await db.query(
            `UPDATE users SET 
                first_name = $1,
                last_name = $2,
                organization = $3,
                phone = $4,
                city = $5,
                state = $6,
                pincode = $7
             WHERE id = $8`,
            [
                first_name  || null,
                last_name   || null,
                company     || null,
                phone       || null,
                city        || null,
                state       || null,
                pincode     || null,
                userId
            ]
        );
        
        const result = await db.query(
            'SELECT id, email, role, first_name, last_name, organization, phone, city, state, pincode, photo_url FROM users WHERE id = $1',
            [userId]
        );
        
        res.json({ success: true, user: result.rows[0] });
    } catch (err) {
        console.error('Profile update error:', err);
        res.status(500).json({ error: 'Failed to update profile data', detail: err.message });
    }
};

// @desc    Save bank details for expert payout
// @route   PUT /api/profile/bank-details
export const saveBankDetails = async (req, res) => {
    try {
        const userId = req.user.id;
        const { accountHolderName, bankAccountNumber, ifscCode } = req.body;

        if (!accountHolderName?.trim()) return res.status(400).json({ message: 'Account holder name is required' });
        if (!bankAccountNumber?.trim()) return res.status(400).json({ message: 'Account number is required' });
        if (!ifscCode?.trim()) return res.status(400).json({ message: 'IFSC code is required' });

        const digits = bankAccountNumber.replace(/\s/g, '');

        // Upsert producer_profiles row
        await db.query(
            `INSERT INTO producer_profiles (user_id, bank_account_number, account_number, ifsc_code, account_holder_name)
             VALUES ($1, $2, $2, $3, $4)
             ON CONFLICT (user_id) DO UPDATE
             SET bank_account_number = $2,
                 account_number = $2,
                 ifsc_code = $3,
                 account_holder_name = $4,
                 updated_at = CURRENT_TIMESTAMP`,
            [userId, digits, ifscCode.toUpperCase(), accountHolderName.trim()]
        );

        res.json({ success: true, message: 'Bank details saved successfully' });
    } catch (err) {
        console.error('[Profile] Bank details save error:', err);
        res.status(500).json({ message: 'Failed to save bank details' });
    }
};
