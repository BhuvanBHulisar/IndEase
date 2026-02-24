
const { Client } = require('pg');
require('dotenv').config();

const commonPasswords = [
    process.env.DB_PASSWORD, // Try current first
    'postgres',
    'admin',
    'password',
    'root',
    '123456',
    '1234',
    ''
];

async function checkPasswords() {
    console.log('Checking database connection with common passwords...');

    for (const password of commonPasswords) {
        if (password === undefined) continue;

        const client = new Client({
            user: process.env.DB_USER || 'postgres',
            host: process.env.DB_HOST || 'localhost',
            database: process.env.DB_NAME || 'originode_db',
            password: password,
            port: process.env.DB_PORT || 5432,
        });

        try {
            await client.connect();
            console.log(`SUCCESS: Connected with password: "${password}"`);
            await client.end();
            return password;
        } catch (err) {
            console.log(`Failed with password "${password}": ${err.message}`);
            // Ignore error and try next
        }
    }

    console.log('FAILURE: Could not connect with any common password.');
    return null;
}

checkPasswords();
