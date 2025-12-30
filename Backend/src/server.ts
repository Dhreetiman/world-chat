import http from 'http';
import { Server } from 'socket.io';
import app from './app';
import prisma from './config/db';
import { initializeSocketHandlers } from './socket';
import { startAllJobs } from './jobs/messageCleanup';

// Load environment variables
import 'dotenv/config';

const PORT = process.env.PORT || 4000;

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
    cors: {
        origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
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
        startAllJobs();

        // Start listening
        server.listen(PORT, () => {
            console.log('');
            console.log('🌍 ================================================');
            console.log('🌍   OPEN WORLD CHAT - Backend Server');
            console.log('🌍 ================================================');
            console.log(`🚀 Server running on port ${PORT}`);
            console.log(`📡 Socket.io ready for connections`);
            console.log(`🔗 API: http://localhost:${PORT}/api`);
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
