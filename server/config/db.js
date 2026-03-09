const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL && process.env.DATABASE_URL.includes('render') ? { rejectUnauthorized: false } : false
});

pool.on('error', (err) => {
    console.error('PostgreSQL connection error:', err);
});

module.exports = pool;
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`,
    ssl: {
        rejectUnauthorized: false
    },
    connectionTimeoutMillis: 10000, // 10s wait for connection
    idleTimeoutMillis: 30000,     // 30s idle before closing
});

pool.on('error', (err) => {
    console.error('[Database] Unexpected error on idle client', err);
});

export default {
    query: (text, params) => pool.query(text, params),
    pool
};
