require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
const errorHandler = require('./middleware/errorHandler');
const sessionRoutes = require('./routes/sessions');
const notificationRoutes = require('./routes/notifications');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// ✅ CORS Configuration - Allow multiple origins
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:8080',
  'http://localhost:8081',
  'http://localhost:3000',
  'https://moo-music-tracker.hearu.fun',
  'https://www.moo-music-tracker.hearu.fun',
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log(`⚠️ CORS blocked origin: ${origin}`);
      callback(null, true); // Allow all origins for now (remove in strict production)
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Request logging middleware
app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.path}`);
  next();
});

// ✅ Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Backend is running 🚀',
    timestamp: new Date().toISOString(),
  });
});

// ✅ API Routes
app.use('/api/sessions', sessionRoutes);
app.use('/api/notifications', notificationRoutes);

// ✅ Root endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Moo Music Tracker Backend API',
    version: '1.0.0',
    endpoints: {
      POST: '/api/sessions',
      GET: '/api/sessions',
      GET: '/api/sessions/:id',
      PATCH: '/api/sessions/:id',
      DELETE: '/api/sessions/:id',
      GET: '/api/sessions/stats/overview',
      POST: '/api/notifications/whatsapp',
      POST: '/api/notifications/sms',
      POST: '/api/notifications/bulk',
      POST: '/api/notifications/test',
      GET: '/api/notifications/status',
    },
  });
});

// ✅ 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
    path: req.path,
  });
});

// ✅ Error handling middleware
app.use(errorHandler);

// ✅ Database connection & server start
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Start Express server
    app.listen(PORT, () => {
      console.log(`\n🎵 Moo Music Tracker Backend Server`);
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📍 API base: http://localhost:${PORT}/api`);
      console.log(`💾 Database: Connected`);
      console.log(`\n✅ Ready to accept requests!\n`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n🛑 Server shutting down gracefully...');
  process.exit(0);
});
