import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import db from './db.js';

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL,
    proxy: true
}, async (accessToken, refreshToken, profile, done) => {
    console.log('[GoogleStrategy] Callback triggered');
    try {
        const { id: googleId, emails, name } = profile;
        const email = emails[0].value;
        const firstName = name.givenName || 'Google';
        const lastName = name.familyName || 'User';
        console.log('[GoogleStrategy] Profile:', profile);

        // 1. Check if user exists with this google_id
        let result = await db.query('SELECT * FROM users WHERE google_id = $1', [googleId]);
        console.log('[GoogleStrategy] DB google_id result:', result.rows);
        if (result.rows.length > 0) {
            return done(null, result.rows[0]);
        }

        // 2. Check if user exists with this email but no google_id
        result = await db.query('SELECT * FROM users WHERE LOWER(email) = $1', [email.toLowerCase()]);
        console.log('[GoogleStrategy] DB email result:', result.rows);
        if (result.rows.length > 0) {
            const user = result.rows[0];
            // Link Google account
            await db.query('UPDATE users SET google_id = $1 WHERE id = $2', [googleId, user.id]);
            user.google_id = googleId;
            return done(null, user);
        }

        // 3. Create new user
        const newUserResult = await db.query(
            'INSERT INTO users (email, password, first_name, last_name, google_id, role, email_verified, provider) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
            [email.toLowerCase(), 'oauth_managed', firstName, lastName, googleId, 'consumer', true, 'google']
        );
        console.log('[GoogleStrategy] New user created:', newUserResult.rows[0]);
        return done(null, newUserResult.rows[0]);
    } catch (err) {
        console.error('[GoogleStrategy] Error:', err);
        return done(err, null);
    }
}));

// Passport session serialization (not strictly needed for JWT but good practice)
passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
    try {
        const result = await db.query('SELECT * FROM users WHERE id = $1', [id]);
        done(null, result.rows[0]);
    } catch (err) {
        done(err, null);
    }
});

export default passport;
