require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Test route
app.get('/api/health', (req, res) => {
    res.json({ status: 'Backend running' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import { createServer } from 'http';
import { Server } from 'socket.io';
import db from './config/db.js';
import passport from './config/passport.js';
import authRoutes from './routes/auth.routes.js';
import paymentRoutes from './routes/payment.js';
import jobRoutes from './routes/jobRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import { errorHandler } from './middleware/error.middleware.js';
import machineRoutes from './routes/machineRoutes.js';
import { saveMessage } from './controllers/chatController.js';

import adminRouter from './routes/admin.js';
const app = express();
const httpServer = createServer(app);

// 1. GLOBAL MIDDLEWARE
app.use(helmet());
app.use(cors({
    origin: ["http://localhost:5173", "http://localhost:5174"],
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
        origin: ["http://localhost:5173", "http://localhost:5174"],
        methods: ["GET", "POST"],
        credentials: true
    },
    transports: ["websocket", "polling"]
});
app.set('socketio', io);
global.io = io; // For controllers to access without req object

// 3. ROUTES
app.use('/api/auth', authRoutes);
app.use('/auth', authRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/machines', machineRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/admin', adminRouter);

app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'Industrial Core Operational' });
});

// 4. REAL-TIME SIGNALS
io.on('connection', (socket) => {
    console.log(`[Socket] Identity connected: ${socket.id}`);

    socket.on('identify', (userId) => {
        socket.join(`user_${userId}`);
        console.log(`[Socket] Registered user room: user_${userId}`);
    });

    socket.on('send_message', async (data) => {
        const { requestId, senderId, text } = data;
        console.log(`[Socket] Incoming signal in session ${requestId} from source ${senderId}`);

        // Persist to DB (Mock or Real)
        const saved = await saveMessage(requestId, senderId, text);

        // Broadcast to all (for demo simplicity)
        io.emit('new_message', saved);
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
  🚀 ORIGINODE SECURE API V2.1
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
