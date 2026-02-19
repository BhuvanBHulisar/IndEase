require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

// Initialize Socket.io with CORS for the React frontend
const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_URL || "http://localhost:5173",
        methods: ["GET", "POST"]
    }
});

// Make io accessible to our routes/controllers
app.set('socketio', io);

// Middleware
app.use(helmet()); // Security headers
app.use(cors());   // Enable cross-origin requests
app.use(morgan('dev')); // Request logging
app.use(express.json()); // Parse JSON bodies

// Route Mounting
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/machines', require('./routes/machineRoutes'));
app.use('/api/jobs', require('./routes/jobRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));
app.use('/api/finance', require('./routes/financeRoutes'));

// Basic Health Check Route
app.get('/api/health', (req, res) => {
    res.status(200).json({
        status: 'Operational',
        timestamp: new Date().toISOString(),
        service: 'origiNode Core API'
    });
});

// Socket.io Connection Logic
const chatController = require('./controllers/chatController');

io.on('connection', (socket) => {
    console.log(`[Socket] New connection: ${socket.id}`);

    // Join Radar sector
    socket.on('join_radar', (role) => {
        console.log(`[Socket] User joined radar as ${role}`);
        socket.join('radar_room');
    });

    // Join specific Job Room
    socket.on('join_job', (requestId) => {
        console.log(`[Socket] User joined channel for Request ${requestId}`);
        socket.join(`job_${requestId}`);
    });

    // Real-time Messaging
    socket.on('send_message', async ({ requestId, senderId, text }) => {
        const savedMsg = await chatController.saveMessage(requestId, senderId, text);
        if (savedMsg) {
            // Broadcast to everyone in the room (including sender for confirmation)
            io.to(`job_${requestId}`).emit('new_message', savedMsg);
        }
    });

    socket.on('disconnect', () => {
        console.log(`[Socket] User disconnected`);
    });
});

// Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`
  🚀 ORIGINODE BACKEND INITIALIZED
  --------------------------------
  📡 API Server : http://localhost:${PORT}
  🌍 Mode       : ${process.env.NODE_ENV || 'development'}
  --------------------------------
  `);
});
