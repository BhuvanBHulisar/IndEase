import db from '../config/db.js';
import { sendSupportEmail } from '../utils/mailer.js';

const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || 'originode7@gmail.com';

// Ensure support_tickets table exists with full schema
const ensureSupportTable = async () => {
    await db.query(`
        CREATE TABLE IF NOT EXISTS support_tickets (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID REFERENCES users(id) ON DELETE SET NULL,
            name VARCHAR(255),
            email VARCHAR(255),
            subject VARCHAR(255) NOT NULL,
            message TEXT NOT NULL,
            status VARCHAR(50) DEFAULT 'open',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
    `);
    // Add missing columns if table already existed with old schema
    await db.query(`ALTER TABLE support_tickets ADD COLUMN IF NOT EXISTS name VARCHAR(255)`);
    await db.query(`ALTER TABLE support_tickets ADD COLUMN IF NOT EXISTS email VARCHAR(255)`);
    await db.query(`ALTER TABLE support_tickets ADD COLUMN IF NOT EXISTS message TEXT`);
    await db.query(`ALTER TABLE support_tickets ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'open'`);
};

// @desc    Submit a new support ticket
// @route   POST /api/support/tickets
export const createTicket = async (req, res) => {
    const userId = req.user.id;
    const { subject, message, description, name, email } = req.body;
    const ticketMessage = message || description || '';
    const ticketSubject = subject || 'General Support';

    if (!ticketSubject || !ticketMessage) {
        return res.status(400).json({ message: 'Subject and message are required' });
    }

    // Resolve name and email from body or user record
    let resolvedName = name;
    let resolvedEmail = email;

    if (!resolvedName || !resolvedEmail) {
        try {
            const { rows } = await db.query(
                `SELECT first_name, last_name, email FROM users WHERE id = $1`,
                [userId]
            );
            if (rows.length > 0) {
                const u = rows[0];
                resolvedName = resolvedName || `${u.first_name || ''} ${u.last_name || ''}`.trim() || 'User';
                resolvedEmail = resolvedEmail || u.email;
            }
        } catch (e) {
            resolvedName = resolvedName || 'User';
            resolvedEmail = resolvedEmail || '';
        }
    }

    try {
        await ensureSupportTable();

        const result = await db.query(
            `INSERT INTO support_tickets (user_id, name, email, subject, message, status)
             VALUES ($1, $2, $3, $4, $5, 'open') RETURNING *`,
            [userId, resolvedName, resolvedEmail, ticketSubject, ticketMessage]
        );

        const ticket = result.rows[0];

        // FIX 2 — Add debug log to confirm DB save
        console.log('[Support] Ticket saved to DB:', ticket.id, '| Subject:', ticketSubject);

        // Send email to support (non-blocking)
        sendSupportEmail({
            name: resolvedName,
            email: resolvedEmail,
            subject: ticketSubject,
            message: ticketMessage
        }).catch(err => console.error('[Support] Email send failed:', err.message));

        return res.status(201).json({
            message: 'Your request has been sent. Our team will contact you soon.',
            ticketId: ticket?.id || 'ref-' + Date.now()
        });
    } catch (err) {
        // FIX 1 — Remove silent DB failure fallback
        console.error('[Support] Ticket creation failure:', err.message);
        return res.status(500).json({ 
            message: 'Failed to submit support request. Please email us at originode7@gmail.com'
        });
    }
};

// @desc    Get all tickets for current user
// @route   GET /api/support/tickets
export const getMyTickets = async (req, res) => {
    try {
        const userId = req.user.id;
        const result = await db.query(
            `SELECT id, subject, message, status, created_at FROM support_tickets
             WHERE user_id = $1 ORDER BY created_at DESC`,
            [userId]
        );
        return res.json(result.rows || []);
    } catch (err) {
        console.error('[Support] Fetch failure:', err);
        return res.json([]);
    }
};

// @desc    Get all support tickets (Admin)
// @route   GET /api/admin/support
export const getAllTickets = async (req, res) => {
    try {
        await ensureSupportTable();
        const result = await db.query(`
            SELECT st.id, st.name, st.email, st.subject, st.message, st.status, st.created_at,
                   COALESCE(u.email, st.email) AS user_email
            FROM support_tickets st
            LEFT JOIN users u ON st.user_id = u.id
            ORDER BY st.created_at DESC
        `);
        return res.json(result.rows || []);
    } catch (err) {
        console.error('[Admin Support] Fetch failure:', err);
        return res.status(500).json({ 
            error: `Something went wrong. Please contact support at ${SUPPORT_EMAIL}` 
        });
    }
};

// @desc    Update ticket status (Admin)
// @route   PATCH /api/admin/support/:id/status
export const updateTicketStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    if (!status) return res.status(400).json({ error: 'Status is required' });

    try {
        await db.query(
            `UPDATE support_tickets SET status = $1, updated_at = NOW() WHERE id = $2`,
            [status, id]
        );
        return res.json({ success: true });
    } catch (err) {
        console.error('[Admin Support] Status update failure:', err);
        return res.status(500).json({ 
            error: `Something went wrong. Please contact support at ${SUPPORT_EMAIL}` 
        });
    }
};
