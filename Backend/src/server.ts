import http from 'http';
import { Server } from 'socket.io';
import app from './app';
import prisma from './config/db';
import { initializeSocketHandlers } from './socket';
// import { startAllJobs } from './jobs/messageCleanup'; // Temporarily disabled - needs schema update

// Load environment variables
import 'dotenv/config';

const PORT = process.env.PORT || 4000;

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.io with CORS - allow all origins
const io = new Server(server, {
    cors: {
        origin: (origin, callback) => {
            // Reflect the requesting origin (allows all origins with credentials)
            callback(null, origin || true);
        },
        methods: ['GET', 'POST'],
        credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
});

// Initialize socket handlers
initializeSocketHandlers(io);

// Start server
const startServer = async () => {
    try {
        // Test database connection
        await prisma.$connect();
        console.log('✅ Database connected successfully');

        // Start cleanup jobs
        // startAllJobs(); // Temporarily disabled - needs schema update

        // Start listening
        server.listen(PORT, () => {
            console.log('');
            console.log('🌍 ================================================');
            console.log('🌍   WORLD CHAT V2 - Backend Server');
            console.log('🌍 ================================================');
            console.log(`🚀 Server running on port ${PORT}`);
            console.log(`📡 Socket.io ready with JWT authentication`);
            console.log(`🔗 API: http://localhost:${PORT}/api`);
            console.log(`🔐 Auth: http://localhost:${PORT}/api/auth`);
            console.log(`❤️  Health: http://localhost:${PORT}/api/health`);
            console.log('🌍 ================================================');
            console.log('');
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};

// Handle graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n🛑 Shutting down gracefully...');
    await prisma.$disconnect();
    server.close(() => {
        console.log('👋 Server closed');
        process.exit(0);
    });
});

process.on('SIGTERM', async () => {
    console.log('\n🛑 SIGTERM received. Shutting down...');
    await prisma.$disconnect();
    server.close(() => {
        process.exit(0);
    });
});

// Start the server
startServer();

export { io };
