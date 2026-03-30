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
import financeRoutes from './routes/financeRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import { errorHandler } from './middleware/error.middleware.js';
import machineRoutes from './routes/machineRoutes.js';
import { saveMessage } from './controllers/chatController.js';
import adminRouter, { ensureAdminSchema } from './routes/admin.js';
import notificationsRoutes from './routes/notifications.routes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import providerRoutes from './routes/providerRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import supportRoutes from './routes/supportRoutes.js';
import { ensureExpertPerformanceSchema } from './services/expertPerformanceSchema.js';
import { ensurePaymentSchema } from './services/paymentSchema.js';
import { startExpertPerformanceCron } from './services/expertPerformanceService.js';

const app = express();
const server = createServer(app);

const io = new Server(server, {
    cors: {
        origin: ["http://localhost:5173", "http://localhost:5174", "http://localhost:5176"],
        methods: ['GET', 'POST']
    }
});

app.set('socketio', io);
global.io = io; // For controllers to access without req object

// 1. GLOBAL MIDDLEWARE
app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    crossOriginOpenerPolicy: false,
}));
app.use(cors({
    origin: ["http://localhost:5173", "http://localhost:5174", "http://localhost:5176", "http://127.0.0.1:5173", "http://127.0.0.1:5174", "http://127.0.0.1:5176"],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token'],
    exposedHeaders: ['Content-Type', 'Authorization'],
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

// 2. ROUTES
app.use('/api/auth', authRoutes);
app.use('/auth', authRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/machines', machineRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/admin/notifications', notificationsRoutes);
app.use('/api/analytics', adminRouter);
app.use('/api/admin', adminRouter);
app.use('/api/reviews', reviewRoutes);
app.use('/api/providers', providerRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/support', supportRoutes);

app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

// 3. ERROR HANDLING
app.use(errorHandler);

// 4. REAL-TIME SIGNALS
io.on('connection', (socket) => {
    console.log('Socket connected:', socket.id);
    socket.on('disconnect', () => {
        console.log('Socket disconnected:', socket.id);
        if (socket.data.userId) {
            io.emit('expert_offline', { userId: socket.data.userId });
        }
    });
    socket.on('identify', (userId) => {
        socket.join(`user_${userId}`);
        socket.data.userId = userId;
        console.log(`[Socket] Registered user room: user_${userId}`);
        io.emit('expert_online', { userId });
    });

    socket.on('send_message', async (data) => {
        const { requestId, senderId, text } = data;
        console.log(`[Socket] Incoming signal in session ${requestId} from source ${senderId}`);
        const saved = await saveMessage(requestId, senderId, text);
        io.emit('new_message', saved);
    });
});

async function startServer(retries = 5) {
    const PORT = process.env.PORT || 5000;
    while (retries > 0) {
        try {
            console.log(`[Startup] Attempting database connection (Retries left: ${retries})...`);
            await db.query('SELECT NOW()');
            
            // Sequential schema verification
            await ensureAdminSchema();
            await ensureExpertPerformanceSchema();
            await ensurePaymentSchema();
            
            startExpertPerformanceCron();
            // Database connection verified...

            server.on('error', (err) => {
                if (err.code === 'EADDRINUSE') {
                    console.error(`Port ${PORT} is in use. Kill the process: npx kill-port ${PORT}`);
                    process.exit(1);
                }
            });

            server.listen(PORT, () => {
                console.log('Server running on port', PORT);
                console.log('-----------------------------------');
            });
            return; 
        } catch (error) {
            console.error(`[Startup] Connection attempt failed: ${error.message}`);
            retries--;
            if (retries === 0) {
                console.error('[Startup] Critical system failure: Could not connect to database after multiple attempts.');
                process.exit(1);
            }
            console.log('Retrying in 5 seconds...');
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
    }
}

startServer();
