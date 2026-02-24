const db = require('../db');

// @desc    Search legacy manufacturer database
// @route   GET /api/legacy/search?q=query
exports.searchLegacy = async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) return res.json([]);

        const result = await db.query(
            `SELECT * FROM legacy_manufacturers 
             WHERE name ILIKE $1 OR category ILIKE $1 
             ORDER BY name ASC`,
            [`%${q}%`]
        );

        // Fallback to initial mock set if table is empty for first-time use
        if (result.rows.length === 0) {
            const defaults = [
                { id: 101, name: "Hydra-Tech Germany", operating_years: "1970-1995", status: "Dissolved", replacement: "Berlin Industrial Corp", category: "Hydraulics" },
                { id: 102, name: "Textile-Matic UK", operating_years: "1982-2004", status: "Acquired", replacement: "Global Weaver Group", category: "Textiles" },
                { id: 103, name: "Precision Motors Inc", operating_years: "1965-Present", status: "Active", replacement: "Direct Support Available", category: "Motors" }
            ];

            // Minimalist filter for local fallback
            const filtered = defaults.filter(item =>
                item.name.toLowerCase().includes(q.toLowerCase()) ||
                item.category.toLowerCase().includes(q.toLowerCase())
            );
            return res.json(filtered);
        }

        res.json(result.rows);
    } catch (err) {
        console.error('[Legacy Search] Failure:', err);
        res.status(500).json({ message: 'Could not query legacy database' });
    }
};

// @desc    Seed legacy database with initial records (Dev Only)
exports.seedLegacy = async (req, res) => {
    try {
        const records = [
            ['Hydra-Tech Germany', '1970-1995', 'Dissolved', 'Berlin Industrial Corp', 'Hydraulics'],
            ['Textile-Matic UK', '1982-2004', 'Acquired', 'Global Weaver Group', 'Textiles'],
            ['Precision Motors Inc', '1965-Present', 'Active', 'Direct Support Available', 'Motors']
        ];

        for (const row of records) {
            await db.query(
                `INSERT INTO legacy_manufacturers (name, operating_years, status, replacement, category) 
                 VALUES ($1, $2, $3, $4, $5) 
                 ON CONFLICT DO NOTHING`,
                row
            );
        }

        res.json({ message: 'Legacy database seeded successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Seeding failed' });
    }
};
