// server/src/index.js
// MARCUS AI PERFORMANCE MARKETER - MAIN SERVER
// Production-Ready Express Backend with Live API Integrations

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const mongoose = require('mongoose');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();

// Import Routes
const authRoutes = require('./routes/auth');
const campaignRoutes = require('./routes/campaigns');
const performanceRoutes = require('./routes/performance');
const aiConsultantRoutes = require('./routes/aiConsultant');
const apiSettingsRoutes = require('./routes/apiSettings');

// Import Services
const livePerformanceService = require('./services/livePerformanceService');

const app = express();
const server = http.createServer(app);

// Socket.IO für Real-time Updates
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Global Socket Instance für Services
global.socketIO = io;

// ============================================
// MIDDLEWARE SETUP
// ============================================

// Security Middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS Configuration
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 100 : 1000, // Production: 100, Dev: 1000 requests per window
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: 15 * 60 * 1000
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// API Rate Limiting für AI Endpoints (teurer)
const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20, // 20 AI requests per minute
  message: {
    error: 'AI request limit exceeded. Please wait before making more AI requests.',
    retryAfter: 60 * 1000
  }
});
app.use('/api/ai', aiLimiter);

// Body Parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression
app.use(compression());

// Logging
if (process.env.NODE_ENV === 'production') {
  app.use(morgan('combined'));
} else {
  app.use(morgan('dev'));
}

// ============================================
// DATABASE CONNECTION
// ============================================

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/marcus-ai';

    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('🤖 MARCUS DATABASE: CONNECTED ✅');
    console.log(`📊 MongoDB: ${mongoURI}`);

    // Start Live Performance Monitoring after DB connection
    livePerformanceService.startMonitoring();

  } catch (error) {
    console.error('❌ DATABASE CONNECTION FAILED:', error.message);
    process.exit(1);
  }
};

// ============================================
// API ROUTES
// ============================================

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'Marcus AI Performance Marketer',
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    uptime: process.uptime()
  });
});

// API Status Dashboard
app.get('/api/status', async (req, res) => {
  try {
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';

    // Check External API Status
    const apiStatus = {
      openai: process.env.OPENAI_API_KEY ? 'configured' : 'missing',
      google_ads: process.env.GOOGLE_ADS_DEVELOPER_TOKEN ? 'configured' : 'missing',
      meta_ads: process.env.META_ACCESS_TOKEN ? 'configured' : 'missing'
    };

    // System Metrics
    const systemMetrics = {
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        external: Math.round(process.memoryUsage().external / 1024 / 1024)
      },
      uptime: Math.round(process.uptime()),
      cpu: process.cpuUsage()
    };

    res.json({
      status: 'operational',
      timestamp: new Date().toISOString(),
      database: dbStatus,
      external_apis: apiStatus,
      system: systemMetrics,
      active_connections: io.engine.clientsCount || 0
    });

  } catch (error) {
    console.error('❌ Status Check Error:', error);
    res.status(500).json({
      status: 'error',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Mount API Routes
app.use('/api/auth', authRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/performance', performanceRoutes);
app.use('/api/ai', aiConsultantRoutes);
app.use('/api/settings', apiSettingsRoutes);

// ============================================
// WEBSOCKET HANDLING
// ============================================

io.on('connection', (socket) => {
  console.log(`🔌 Client connected: ${socket.id}`);

  // Join User to their room for personalized updates
  socket.on('join_user_room', (userId) => {
    socket.join(`user_${userId}`);
    console.log(`👤 User ${userId} joined room`);

    // Send current system status
    socket.emit('system_status', {
      status: 'connected',
      timestamp: new Date().toISOString(),
      marcus_status: 'online'
    });
  });

  // Handle AI Chat Requests via Socket (für real-time)
  socket.on('ai_chat_request', async (data) => {
    try {
      const { message, userId, context } = data;

      // Emit that AI is processing
      socket.emit('ai_processing', {
        status: 'processing',
        timestamp: new Date().toISOString()
      });

      // TODO: Process with AI Service (wird in aiConsultantController gemacht)
      console.log(`🤖 AI Request from User ${userId}: ${message}`);

    } catch (error) {
      console.error('❌ AI Chat Socket Error:', error);
      socket.emit('ai_error', {
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  });

  // Handle Campaign Updates
  socket.on('campaign_update_request', (data) => {
    console.log(`📊 Campaign update request:`, data);
    // TODO: Trigger campaign refresh
  });

  socket.on('disconnect', () => {
    console.log(`🔌 Client disconnected: ${socket.id}`);
  });
});

// ============================================
// ERROR HANDLING
// ============================================

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('🚨 Global Error:', err.stack);

  // Don't leak error details in production
  const isDev = process.env.NODE_ENV === 'development';

  res.status(err.status || 500).json({
    error: isDev ? err.message : 'Internal Server Error',
    status: err.status || 500,
    timestamp: new Date().toISOString(),
    ...(isDev && { stack: err.stack })
  });
});

// 404 Handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'API Endpoint not found',
    status: 404,
    timestamp: new Date().toISOString(),
    requested_url: req.originalUrl
  });
});

// ============================================
// SERVER STARTUP
// ============================================

const PORT = process.env.PORT || 3001;

const startServer = async () => {
  try {
    // Connect to Database first
    await connectDB();

    // Start Server
    server.listen(PORT, () => {
      console.log('');
      console.log('🤖 ===============================================');
      console.log('🚀 MARCUS AI PERFORMANCE MARKETER - SERVER ONLINE');
      console.log('🤖 ===============================================');
      console.log(`📡 Server: http://localhost:${PORT}`);
      console.log(`🎯 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`⚡ Socket.IO: ENABLED`);
      console.log(`🛡️  Security: HELMET + CORS + RATE LIMITING`);
      console.log(`📊 Live Performance Monitoring: ACTIVE`);
      console.log('🤖 ===============================================');
      console.log('');
    });

  } catch (error) {
    console.error('❌ SERVER STARTUP FAILED:', error);
    process.exit(1);
  }
};

// Graceful Shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('🤖 Marcus AI Server closed');
    mongoose.connection.close(() => {
      console.log('📊 Database connection closed');
      process.exit(0);
    });
  });
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully...');
  server.close(() => {
    console.log('🤖 Marcus AI Server closed');
    mongoose.connection.close(() => {
      console.log('📊 Database connection closed');
      process.exit(0);
    });
  });
});

// Start the Marcus AI Server
startServer();

module.exports = { app, server, io };