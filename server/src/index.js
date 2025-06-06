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

// ============================================
// IMPORT MARCUS DATABASE CONFIG (FIXED!)
// ============================================
const database = require('./config/database');

// Import Routes
const authRoutes = require('./routes/auth');
const campaignRoutes = require('./routes/campaigns');
const performanceRoutes = require('./routes/performance');
const aiConsultantRoutes = require('./routes/aiConsultant');
const apiSettingsRoutes = require('./routes/apiSettings');
const googleAdsRoutes = require('./routes/googleAds');
const marketIntelligenceRoutes = require('./routes/marketIntelligence');

// Import Services
const livePerformanceService = require('./services/livePerformanceService');
const googleAdsService = require('./services/integrations/googleAdsService');

const app = express();
const server = http.createServer(app);

// Socket.IO für Real-time Updates
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
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
  origin: process.env.CLIENT_URL || "http://localhost:3000",
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
// API ROUTES
// ============================================

// Health Check
app.get('/api/health', async (req, res) => {
  try {
    const dbHealth = await database.getHealthStatus();

    res.json({
      status: 'online',
      timestamp: new Date().toISOString(),
      service: 'Marcus AI Performance Marketer',
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      database: dbHealth,
      uptime: process.uptime()
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// API Status Dashboard
app.get('/api/status', async (req, res) => {
  try {
    const dbHealth = await database.getHealthStatus();

    // Check External API Status
    const apiStatus = {
      openai: process.env.OPENAI_API_KEY ? 'configured' : 'missing',
      google_ads: process.env.GOOGLE_ADS_DEVELOPER_TOKEN ? 'configured' : 'missing',
      meta_ads: process.env.META_ACCESS_TOKEN ? 'configured' : 'missing'
    };

    // Test Google Ads API Connection LIVE
    let googleAdsStatus = { status: 'not_configured' };
    if (process.env.GOOGLE_ADS_DEVELOPER_TOKEN) {
      try {
        console.log('🔌 Testing Google Ads API connection...');
        googleAdsStatus = await googleAdsService.testConnection();
        console.log('🔍 Google Ads test result:', googleAdsStatus);
      } catch (error) {
        console.error('❌ Google Ads test failed:', error);
        googleAdsStatus = {
          status: 'error',
          message: error.message
        };
      }
    }

    // Test OpenAI API Connection
    let openaiStatus = { status: 'not_configured' };
    if (process.env.OPENAI_API_KEY) {
      try {
        console.log('🤖 Testing OpenAI API connection...');
        const testResponse = await fetch('https://api.openai.com/v1/models', {
          headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
          }
        });

        if (testResponse.ok) {
          openaiStatus = { status: 'connected', message: 'OpenAI API accessible' };
        } else {
          openaiStatus = { status: 'error', message: 'OpenAI API authentication failed' };
        }
      } catch (error) {
        openaiStatus = { status: 'error', message: error.message };
      }
    }

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

    // Marcus Intelligence Status
    const marcusIntelligence = {
      aiCore: openaiStatus.status === 'connected' ? 'online' : 'offline',
      marketData: googleAdsStatus.status === 'connected' ? 'online' : 'offline',
      intelligence: (openaiStatus.status === 'connected' && googleAdsStatus.status === 'connected') ? 'full' : 'limited'
    };

    res.json({
      status: 'operational',
      timestamp: new Date().toISOString(),
      database: dbHealth,
      external_apis: {
        ...apiStatus,
        openai_status: openaiStatus,
        google_ads_status: googleAdsStatus
      },
      marcus_intelligence: marcusIntelligence,
      system: systemMetrics,
      active_connections: io.engine.clientsCount || 0,
      environment: process.env.NODE_ENV || 'development'
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
app.use('/api/google-ads', googleAdsRoutes);
app.use('/api/market-intelligence', marketIntelligenceRoutes);

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
// SERVER STARTUP WITH MARCUS DATABASE
// ============================================

const PORT = process.env.PORT || 3001;

const startServer = async () => {
  try {
    console.log('🤖 Starting Marcus AI Server...');

    // Connect to Database using Marcus Database Config (FIXED!)
    console.log('📊 Connecting to Marcus Database...');
    await database.connect();

    // Wait for database to be ready
    await database.waitForReady(10000); // 10 second timeout

    console.log('✅ Marcus Database is ready!');

    // Start Live Performance Monitoring after DB connection
    console.log('📊 Starting Live Performance Monitoring...');
    livePerformanceService.startMonitoring();

    // Start Server
    server.listen(PORT, () => {
      console.log('');
      console.log('🤖 ===============================================');
      console.log('🚀 MARCUS AI PERFORMANCE MARKETER - SERVER ONLINE');
      console.log('🤖 ===============================================');
      console.log(`📡 Server: http://localhost:${PORT}`);
      console.log(`🎯 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📊 Database: CONNECTED via Marcus Config`);
      console.log(`⚡ Socket.IO: ENABLED`);
      console.log(`🛡️  Security: HELMET + CORS + RATE LIMITING`);
      console.log(`📊 Live Performance Monitoring: ACTIVE`);
      console.log(`🤖 Marcus Intelligence: ${database.isReady() ? 'ONLINE' : 'OFFLINE'}`);
      console.log('🤖 ===============================================');
      console.log('');
    });

  } catch (error) {
    console.error('❌ SERVER STARTUP FAILED:', error);
    console.error('🔧 Possible fixes:');
    console.error('   1. Check your .env MONGODB_URI');
    console.error('   2. Verify MongoDB Atlas IP whitelist');
    console.error('   3. Check MongoDB Atlas credentials');
    console.error('   4. Ensure network connectivity');
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