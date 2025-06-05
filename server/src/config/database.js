// server/src/config/database.js
// MARCUS AI - Production-Ready MongoDB Database Configuration
// Optimized for Real-time Performance Marketing Data

const mongoose = require('mongoose');

// Database Configuration Class
class DatabaseConfig {
  constructor() {
    this.isConnected = false;
    this.connectionAttempts = 0;
    this.maxRetries = 5;
    this.retryDelay = 3000; // 5 seconds

    // Event listeners setup
    this.setupEventListeners();
  }

  /**
   * Get MongoDB Connection URI with fallbacks
   */
  getConnectionURI() {
    // Priority: Environment Variable -> Docker -> Local Development
    return process.env.MONGODB_URI ||
           process.env.DATABASE_URL ||
           'mongodb://mongodb:27017/marcus-ai' ||
           'mongodb://localhost:27017/marcus-ai';
  }

  /**
   * Get optimized connection options for Marcus AI
   */
  getConnectionOptions() {
    const isProduction = process.env.NODE_ENV === 'production';

    return {
      // Connection Pool Settings (optimiert für Performance Marketing)
      maxPoolSize: isProduction ? 20 : 10, // Max concurrent connections
      minPoolSize: isProduction ? 5 : 2,   // Min connections to maintain
      maxIdleTimeMS: 30000,                // Close connections after 30s idle
      serverSelectionTimeoutMS: 5000,      // How long to try selecting server
      socketTimeoutMS: 45000,              // Close sockets after 45s inactivity

      // Replica Set & High Availability
      retryWrites: true,                   // Retry failed writes
      retryReads: true,                    // Retry failed reads
      readPreference: 'primaryPreferred',  // Read from primary, fallback to secondary

      // Performance Optimizations
      bufferMaxEntries: 0,                 // Disable mongoose buffering for real-time data
      bufferCommands: false,               // Disable command buffering
      useNewUrlParser: true,
      useUnifiedTopology: true,

      // SSL/TLS for Production
      ...(isProduction && {
        ssl: true,
        sslValidate: true,
        authSource: 'admin'
      }),

      // Development optimizations
      ...(!isProduction && {
        autoIndex: true,                   // Build indexes automatically in dev
        debug: process.env.MONGOOSE_DEBUG === 'true'
      }),

      // Application Name for MongoDB logs
      appName: 'Marcus-AI-Performance-Marketer',

      // Write Concern für Consistency
      writeConcern: {
        w: 'majority',                     // Wait for majority of replica set
        j: true,                          // Wait for journal commit
        wtimeout: 10000                   // Timeout after 10s
      },

      // Read Concern für Data Consistency
      readConcern: {
        level: 'majority'                 // Read only committed data
      }
    };
  }

  /**
   * Setup MongoDB Event Listeners
   */
  setupEventListeners() {
    // Connection Events
    mongoose.connection.on('connected', () => {
      console.log('🤖 MARCUS DATABASE: CONNECTED ✅');
      console.log(`📊 MongoDB URI: ${this.maskConnectionString(this.getConnectionURI())}`);
      console.log(`🔄 Connection Pool: ${mongoose.connection.readyState === 1 ? 'Active' : 'Inactive'}`);
      this.isConnected = true;
      this.connectionAttempts = 0;
    });

    mongoose.connection.on('error', (error) => {
      console.error('❌ MARCUS DATABASE ERROR:', error.message);
      this.isConnected = false;

      // Log specific error types for debugging
      if (error.name === 'MongoNetworkError') {
        console.error('🌐 Network Error - Check MongoDB server status');
      } else if (error.name === 'MongooseServerSelectionError') {
        console.error('⏱️  Server Selection Timeout - Check connection string');
      } else if (error.name === 'MongoParseError') {
        console.error('🔧 Connection String Parse Error - Check MONGODB_URI format');
      }
    });

    mongoose.connection.on('disconnected', () => {
      console.log('🔌 MARCUS DATABASE: DISCONNECTED');
      this.isConnected = false;

      // Auto-reconnect in production
      if (process.env.NODE_ENV === 'production') {
        console.log('🔄 Attempting automatic reconnection...');
        setTimeout(() => {
          this.connect();
        }, this.retryDelay);
      }
    });

    mongoose.connection.on('reconnected', () => {
      console.log('🔄 MARCUS DATABASE: RECONNECTED ✅');
      this.isConnected = true;
    });

    // SIGINT (Ctrl+C) Graceful Shutdown
    process.on('SIGINT', () => {
      this.gracefulShutdown('SIGINT');
    });

    // SIGTERM (Docker/PM2) Graceful Shutdown
    process.on('SIGTERM', () => {
      this.gracefulShutdown('SIGTERM');
    });
  }

  /**
   * Connect to MongoDB with Retry Logic
   */
  async connect() {
    try {
      const uri = this.getConnectionURI();
      const options = this.getConnectionOptions();

      console.log('🤖 MARCUS DATABASE: CONNECTING...');
      console.log(`📊 MongoDB URI: ${this.maskConnectionString(uri)}`);
      console.log(`🎯 Environment: ${process.env.NODE_ENV || 'development'}`);

      await mongoose.connect(uri, options);

      // Setup Marcus-specific database configurations
      await this.setupMarcusDatabase();

      return true;

    } catch (error) {
      this.connectionAttempts++;
      console.error(`❌ MARCUS DATABASE CONNECTION FAILED (Attempt ${this.connectionAttempts}/${this.maxRetries}):`, error.message);

      // Retry logic
      if (this.connectionAttempts < this.maxRetries) {
        console.log(`🔄 Retrying connection in ${this.retryDelay/1000} seconds...`);

        await new Promise(resolve => setTimeout(resolve, this.retryDelay));

        // Exponential backoff
        this.retryDelay = Math.min(this.retryDelay * 1.5, 30000);

        return this.connect();
      } else {
        console.error('💥 MARCUS DATABASE: MAX RETRIES EXCEEDED - SHUTTING DOWN');
        process.exit(1);
      }
    }
  }

  /**
   * Setup Marcus-specific database configurations
   */
  async setupMarcusDatabase() {
    try {
      const db = mongoose.connection.db;

      // Create Marcus-specific indexes for performance
      console.log('📊 Setting up Marcus database optimizations...');

      // Compound Indexes für Performance Marketing Queries
      await db.collection('campaigns').createIndex(
        { userId: 1, status: 1, platform: 1 },
        { background: true, name: 'marcus_user_status_platform' }
      );

      await db.collection('campaigns').createIndex(
        { 'metrics.lastUpdated': -1, status: 1 },
        { background: true, name: 'marcus_metrics_realtime' }
      );

      await db.collection('campaigns').createIndex(
        { platformCampaignId: 1, platform: 1 },
        { background: true, sparse: true, name: 'marcus_platform_sync' }
      );

      // Performance Metrics Collection Indexes
      await db.collection('performancemetrics').createIndex(
        { campaignId: 1, timestamp: -1 },
        { background: true, name: 'marcus_performance_timeline' }
      );

      await db.collection('performancemetrics').createIndex(
        { userId: 1, date: -1 },
        { background: true, name: 'marcus_user_performance' }
      );

      // Market Intelligence Indexes
      await db.collection('marketintelligence').createIndex(
        { industry: 1, platform: 1, timestamp: -1 },
        { background: true, name: 'marcus_market_trends' }
      );

      // User Analytics Indexes
      await db.collection('users').createIndex(
        { email: 1 },
        { unique: true, background: true, name: 'marcus_user_email' }
      );

      // TTL Index für temporary data (z.B. AI processing cache)
      await db.collection('aicache').createIndex(
        { createdAt: 1 },
        { expireAfterSeconds: 3600, background: true, name: 'marcus_ai_cache_ttl' }
      );

      console.log('✅ Marcus database optimizations complete');

      // Log database statistics
      await this.logDatabaseStats();

    } catch (error) {
      console.error('⚠️  Warning: Marcus database setup partially failed:', error.message);
      // Continue anyway - these are optimizations, not critical
    }
  }

  /**
   * Log Database Statistics for Monitoring
   */
  async logDatabaseStats() {
    try {
      const db = mongoose.connection.db;
      const stats = await db.stats();

      console.log('📊 MARCUS DATABASE STATS:');
      console.log(`   📁 Collections: ${stats.collections}`);
      console.log(`   💾 Data Size: ${(stats.dataSize / 1024 / 1024).toFixed(2)} MB`);
      console.log(`   🗂️  Index Size: ${(stats.indexSize / 1024 / 1024).toFixed(2)} MB`);
      console.log(`   📄 Documents: ${stats.objects?.toLocaleString() || 'N/A'}`);

    } catch (error) {
      console.log('📊 Database stats unavailable:', error.message);
    }
  }

  /**
   * Get Database Health Status
   */
  async getHealthStatus() {
    try {
      const state = mongoose.connection.readyState;
      const stateNames = ['disconnected', 'connected', 'connecting', 'disconnecting'];

      const health = {
        status: stateNames[state] || 'unknown',
        connected: state === 1,
        database: mongoose.connection.name,
        host: mongoose.connection.host,
        port: mongoose.connection.port,
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        lastCheck: new Date().toISOString()
      };

      // Test database responsiveness
      if (state === 1) {
        const startTime = Date.now();
        await mongoose.connection.db.admin().ping();
        health.responseTime = Date.now() - startTime;
        health.responsive = true;
      } else {
        health.responsive = false;
      }

      return health;

    } catch (error) {
      return {
        status: 'error',
        connected: false,
        error: error.message,
        lastCheck: new Date().toISOString()
      };
    }
  }

  /**
   * Mask connection string for secure logging
   */
  maskConnectionString(uri) {
    return uri.replace(/:([^:@]+)@/, ':***@');
  }

  /**
   * Graceful shutdown handler
   */
  async gracefulShutdown(signal) {
    console.log(`\n🛑 ${signal} received - Gracefully shutting down Marcus Database...`);

    try {
      await mongoose.connection.close();
      console.log('📊 Marcus Database connection closed cleanly');
      process.exit(0);
    } catch (error) {
      console.error('❌ Error during database shutdown:', error);
      process.exit(1);
    }
  }

  /**
   * Check if database is ready for Marcus operations
   */
  isReady() {
    return this.isConnected && mongoose.connection.readyState === 1;
  }

  /**
   * Wait for database to be ready
   */
  async waitForReady(timeoutMs = 30000) {
    const startTime = Date.now();

    while (!this.isReady() && (Date.now() - startTime) < timeoutMs) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    if (!this.isReady()) {
      throw new Error('Database not ready within timeout period');
    }

    return true;
  }

  /**
   * Force reconnection (useful for connection issues)
   */
  async forceReconnect() {
    console.log('🔄 Forcing database reconnection...');

    try {
      await mongoose.connection.close();
      await this.connect();
      return true;
    } catch (error) {
      console.error('❌ Force reconnect failed:', error);
      return false;
    }
  }
}

// Create singleton instance
const databaseConfig = new DatabaseConfig();

// Export the instance and connection method
module.exports = {
  connect: () => databaseConfig.connect(),
  getHealthStatus: () => databaseConfig.getHealthStatus(),
  isReady: () => databaseConfig.isReady(),
  waitForReady: (timeout) => databaseConfig.waitForReady(timeout),
  forceReconnect: () => databaseConfig.forceReconnect(),
  instance: databaseConfig
};