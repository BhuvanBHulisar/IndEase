import 'dotenv/config';
import db from '../server/config/db.js';
import bcrypt from 'bcryptjs';

async function test() {
    try {
        const email = 'admin@originode.com';
        const password = 'Demo@1234';
        
        const userRes = await db.query(
            'SELECT id, email, role, password_hash FROM users WHERE LOWER(email) = $1',
            [email.toLowerCase()]
        );
        
        if (userRes.rows.length === 0) {
            console.log('User not found');
            return;
        }
        
        const user = userRes.rows[0];
        console.log('User found:', user.email, 'Role:', user.role);
        
        const isMatch = await bcrypt.compare(password, user.password_hash);
        console.log('Password match:', isMatch);
        
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
test();
