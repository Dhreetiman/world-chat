import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import routes from './routes';
import { errorHandler } from './middlewares/errorHandler';

// Load environment variables
import 'dotenv/config';

const app = express();

// CORS configuration - allow all origins if CORS_ORIGIN not set
const corsOrigin = process.env.CORS_ORIGIN;
const allowedOrigins = corsOrigin ? corsOrigin.split(',').map(o => o.trim()) : null;

const corsOptions = {
    origin: allowedOrigins
        ? (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                console.log('CORS blocked origin:', origin);
                callback(null, false);
            }
        }
        : true, // Allow all origins if CORS_ORIGIN not configured
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(process.env.COOKIE_SECRET));

// Serve static avatars
app.use('/avatars', express.static('public/avatars'));

// API Routes
app.use('/api', routes);

// Root endpoint
app.get('/', (_req, res) => {
    res.json({
        name: 'Open World Chat API',
        version: '1.0.0',
        status: 'running',
    });
});

// 404 handler
app.use((_req, res) => {
    res.status(404).json({
        success: false,
        error: { message: 'Endpoint not found' },
    });
});

// Global error handler
app.use(errorHandler);

export default app;
