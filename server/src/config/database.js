// server/src/config/database.js
// MARCUS AI - MongoDB Database Configuration
// Simplified & Compatible Version

const mongoose = require('mongoose');

// Database Configuration Class
class DatabaseConfig {
  constructor() {
    this.isConnected = false;
    this.connectionAttempts = 0;
    this.maxRetries = 5;
    this.retryDelay = 3000;

    // Event listeners setup
    this.setupEventListeners();
  }

  /**
   * Get MongoDB Connection URI with fallbacks
   */
  getConnectionURI() {
    return process.env.MONGODB_URI ||
           process.env.DATABASE_URL ||
           'mongodb://localhost:27017/marcus-ai';
  }

  /**
   * Get SIMPLIFIED connection options (compatible with all Mongoose versions)
   */
  getConnectionOptions() {
    return {
      // Basic options that work everywhere
      useNewUrlParser: true,
      useUnifiedTopology: true,

      // Connection pool (simplified)
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,

      // Retry settings
      retryWrites: true,

      // Application name for logs
      appName: 'Marcus-AI-Performance-Marketer'
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
    });

    mongoose.connection.on('reconnected', () => {
      console.log('🔄 MARCUS DATABASE: RECONNECTED ✅');
      this.isConnected = true;
    });

    // Graceful shutdown handlers
    process.on('SIGINT', () => {
      this.gracefulShutdown('SIGINT');
    });

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

      // Simple success check
      if (mongoose.connection.readyState === 1) {
        console.log('✅ Marcus Database is ready!');
        return true;
      }

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