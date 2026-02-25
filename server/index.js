import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { createServer } from 'http';
import { Server } from 'socket.io';
import db from './config/db.js';
import passport from './config/passport.js';
import authRoutes from './routes/auth.routes.js';
import { errorHandler } from './middleware/error.middleware.js';

const app = express();
import session from 'express-session';
const httpServer = createServer(app);

// 1. GLOBAL MIDDLEWARE
app.use(helmet());
app.use(cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser());
app.use(session({
    secret: process.env.JWT_SECRET || 'originode_session_secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000
    }
}));
app.use(passport.initialize());
app.use(passport.session());

// 2. SOCKET INITIALIZATION
const io = new Server(httpServer, {
    cors: {
        origin: process.env.CLIENT_URL || "http://localhost:5173",
        methods: ["GET", "POST"],
        credentials: true
    }
});
app.set('socketio', io);

// 3. ROUTES
app.use('/api/auth', authRoutes);
app.use('/auth', authRoutes); // Supporting callback URL without /api prefix as per .env

// Mock Health
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'Industrial Core Operational' });
});

// 4. SOCKET LOGIC
io.on('connection', (socket) => {
    console.log(`[Socket] Identity connected: ${socket.id}`);

    socket.on('identify', (userId) => {
        socket.join(`user_${userId}`);
    });

    socket.on('disconnect', () => {
        console.log(`[Socket] Identity severed`);
    });
});

// 5. ERROR HANDLING
app.use(errorHandler);

// 6. STARTUP
const PORT = process.env.PORT || 5000;

async function startServer() {
    try {
        await db.query('SELECT 1');
        console.log('[Database] Integrity probe successful');

        httpServer.listen(PORT, () => {
            console.log(`
  🚀 ORIGINODE SECURE API V2.0
  --------------------------------
  📡 Base Station : http://localhost:${PORT}
  🌍 Environment  : ${process.env.NODE_ENV || 'development'}
  --------------------------------
  `);
        });
    } catch (err) {
        console.error('[Startup] Critical system failure:', err.message);
        process.exit(1);
    }
}

startServer();
