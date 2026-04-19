require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const hash = bcrypt.hashSync('admin123', 10);

pool.query("UPDATE users SET password=$1 WHERE email='admin@originode.com'", [hash])
  .then(() => console.log('Admin password reset to admin123'))
  .catch(console.error)
  .finally(() => pool.end());
