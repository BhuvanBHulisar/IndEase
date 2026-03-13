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
import adminRouter from './routes/admin.js';
import notificationsRoutes from './routes/notifications.routes.js';
import reviewRoutes from './routes/reviewRoutes.js';

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
app.use(helmet());
app.use(cors({
    origin: ["http://localhost:5173", "http://localhost:5174", "http://localhost:5176"],
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

// 2. SOCKET INITIALIZATION (configured above with CORS)

// 3. ROUTES
app.use('/api/auth', authRoutes);
app.use('/auth', authRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/machines', machineRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/admin/notifications', notificationsRoutes);
app.use('/api/analytics', adminRouter); // For /api/analytics/job-distribution
app.use('/api/admin', adminRouter);
app.use('/api/reviews', reviewRoutes);

app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

// 5. ERROR HANDLING
app.use(errorHandler);

// 4. REAL-TIME SIGNALS
io.on('connection', (socket) => {
    console.log('Socket connected:', socket.id);
    socket.on('disconnect', () => {
        console.log('Socket disconnected:', socket.id);
    });
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
});

async function startServer(retries = 5) {
    const PORT = process.env.PORT || 5000;
    try {
        await db.query('SELECT NOW()');
        console.log('Database connection verified');

        server.on('error', (err) => {
            if (err.code === 'EADDRINUSE' && retries > 0) {
                console.log(`Port ${PORT} busy, retrying in 1s... (${retries} attempts left)`);
                setTimeout(() => {
                    server.close();
                    server.listen(PORT);
                }, 1000);
                retries--;
            } else if (err.code === 'EADDRINUSE') {
                console.error(`Port ${PORT} is still in use after retries. Kill the process manually: npx kill-port ${PORT}`);
                process.exit(1);
            }
        });

        server.listen(PORT, () => {
            console.log('Server running on port', PORT);
        });
    } catch (error) {
        console.error('[Startup] Critical system failure:', error.message);
        process.exit(1);
    }
}

startServer();
