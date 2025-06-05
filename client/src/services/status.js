// client/src/services/status.js
// Marcus AI - Comprehensive Status & Intelligence Service

class StatusService {
  constructor() {
    this.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
  }

  // Get comprehensive server status including Google Ads Intelligence
  async getServerStatus() {
    try {
      console.log('🔍 Marcus checking comprehensive system status...');

      const response = await fetch(`${this.baseURL}/api/status`);
      const data = await response.json();

      if (data.status === 'operational') {
        console.log('✅ Marcus System Status:', data);
        return { success: true, data };
      } else {
        console.error('❌ System status check failed:', data);
        return { success: false, error: data.error };
      }

    } catch (error) {
      console.error('❌ Status service error:', error);
      return { success: false, error: error.message };
    }
  }

  // Test Google Ads API connection specifically
  async testGoogleAdsConnection() {
    try {
      console.log('🔌 Marcus testing Google Ads API connection...');

      const response = await fetch(`${this.baseURL}/api/google-ads/test-connection`);
      const data = await response.json();

      if (data.success) {
        console.log('✅ Google Ads API connected:', data.data);
        return { success: true, data: data.data };
      } else {
        console.error('❌ Google Ads API connection failed:', data.error);
        return { success: false, error: data.error };
      }

    } catch (error) {
      console.error('❌ Google Ads connection test error:', error);
      return { success: false, error: error.message };
    }
  }

  // Test Market Intelligence capabilities
  async testMarketIntelligence() {
    try {
      console.log('🧠 Marcus testing Market Intelligence capabilities...');

      // Test keyword research
      const keywordTest = await fetch(`${this.baseURL}/api/market-intelligence/quick-check/marketing`, {
        headers: this.getAuthHeaders()
      });
      const keywordData = await keywordTest.json();

      // Test market intelligence status
      const statusTest = await fetch(`${this.baseURL}/api/market-intelligence/status`, {
        headers: this.getAuthHeaders()
      });
      const statusData = await statusTest.json();

      const intelligence = {
        keywordResearch: keywordData.success,
        marketIntelligence: statusData.success,
        capabilities: statusData.success ? statusData.data.marketIntelligence.capabilities : [],
        intelligenceLevel: statusData.success ? statusData.data.marcusIntelligenceLevel : 'offline'
      };

      console.log('🧠 Marcus Intelligence Test Results:', intelligence);
      return { success: true, data: intelligence };

    } catch (error) {
      console.error('❌ Market Intelligence test error:', error);
      return { success: false, error: error.message };
    }
  }

  // Get Marcus Intelligence Summary
  getMarcusIntelligenceSummary(statusData) {
    if (!statusData) return null;

    const apis = statusData.external_apis || {};
    const system = statusData.system || {};

    let score = 0;
    const capabilities = [];

    // OpenAI AI Core
    if (apis.openai_status?.status === 'connected') {
      score += 25;
      capabilities.push('AI Consultant');
      capabilities.push('Campaign Analysis');
    }

    // Google Ads Market Intelligence
    if (apis.google_ads_status?.status === 'connected') {
      score += 35;
      capabilities.push('Live Market Data');
      capabilities.push('Keyword Research');
      capabilities.push('Competitor Analysis');
      capabilities.push('Industry Benchmarks');
    }

    // Database & System
    if (statusData.database === 'connected') {
      score += 20;
      capabilities.push('Campaign Management');
      capabilities.push('Performance Tracking');
    }

    // System Health
    if (system.uptime > 0) {
      score += 20;
      capabilities.push('Live Monitoring');
    }

    // Determine intelligence level
    let level = 'offline';
    let description = 'Marcus Intelligence Offline';

    if (score >= 80) {
      level = 'maximum';
      description = 'Full Marcus Intelligence - AI + Live Market Data + Performance Tracking';
    } else if (score >= 60) {
      level = 'advanced';
      description = 'Advanced Marcus Intelligence - Major systems online';
    } else if (score >= 40) {
      level = 'limited';
      description = 'Limited Marcus Intelligence - Basic systems operational';
    } else if (score >= 20) {
      level = 'basic';
      description = 'Basic Marcus Intelligence - Core systems only';
    }

    return {
      level,
      description,
      score,
      capabilities,
      timestamp: new Date().toISOString()
    };
  }

  // Format status for Marcus UI display
  formatStatusForMarcus(statusResponse) {
    if (!statusResponse.success) return null;

    const data = statusResponse.data;

    return {
      system: {
        status: data.status,
        uptime: data.uptime || 0,
        memory: data.system?.memory || { used: 0, total: 0 },
        environment: data.environment || 'unknown'
      },
      database: data.database || 'disconnected',
      apis: {
        openai: data.external_apis?.openai_status?.status || 'not_configured',
        googleAds: data.external_apis?.google_ads_status?.status || 'not_configured',
        meta: data.external_apis?.meta_status || 'not_configured'
      },
      marcusIntelligence: data.marcus_intelligence || {
        aiCore: 'offline',
        marketData: 'offline',
        intelligence: 'limited'
      },
      activeConnections: data.active_connections || 0,
      timestamp: data.timestamp || new Date().toISOString()
    };
  }

  // Helper methods for status display
  getStatusColor(status) {
    switch (status) {
      case 'connected':
      case 'online':
      case 'operational':
        return '#00ff41';
      case 'limited':
      case 'connecting':
        return '#ffaa00';
      case 'error':
      case 'offline':
      case 'disconnected':
        return '#ff0040';
      default:
        return '#666666';
    }
  }

  getStatusText(status) {
    switch (status) {
      case 'connected': return 'ONLINE';
      case 'online': return 'ACTIVE';
      case 'operational': return 'READY';
      case 'limited': return 'LIMITED';
      case 'connecting': return 'LOADING';
      case 'error': return 'ERROR';
      case 'offline': return 'OFFLINE';
      case 'disconnected': return 'OFFLINE';
      case 'not_configured': return 'NOT SET';
      default: return 'UNKNOWN';
    }
  }

  // Format uptime for display
  formatUptime(seconds) {
    if (!seconds) return '0s';

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  }

  // Format memory usage
  formatMemory(memory) {
    if (!memory || !memory.used) return '0MB';

    const used = Math.round(memory.used);
    const total = Math.round(memory.total || memory.used);

    return `${used}MB/${total}MB`;
  }

  // Get authentication headers
  getAuthHeaders() {
    const token = localStorage.getItem('marcus_auth_token');
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    };
  }

  // Quick system health check
  async quickHealthCheck() {
    try {
      const healthResponse = await fetch(`${this.baseURL}/api/health`);
      const healthData = await healthResponse.json();

      return {
        success: healthData.status === 'online',
        status: healthData.status,
        uptime: healthData.uptime,
        timestamp: healthData.timestamp
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Live performance check
  async checkLivePerformance() {
    try {
      console.log('📊 Marcus checking live performance capabilities...');

      const response = await fetch(`${this.baseURL}/api/performance/realtime`, {
        headers: this.getAuthHeaders()
      });

      const data = await response.json();

      if (data.success) {
        console.log('✅ Live performance monitoring active');
        return { success: true, data: data.data };
      } else {
        console.error('❌ Live performance check failed');
        return { success: false, error: 'Performance monitoring unavailable' };
      }

    } catch (error) {
      console.error('❌ Live performance check error:', error);
      return { success: false, error: error.message };
    }
  }

  // Comprehensive Marcus capabilities test
  async runFullCapabilitiesTest() {
    console.log('🚀 Marcus running full capabilities test...');

    const results = {
      timestamp: new Date().toISOString(),
      tests: {}
    };

    // Test 1: Basic Health
    results.tests.health = await this.quickHealthCheck();

    // Test 2: Google Ads API
    results.tests.googleAds = await this.testGoogleAdsConnection();

    // Test 3: Market Intelligence
    results.tests.marketIntelligence = await this.testMarketIntelligence();

    // Test 4: Live Performance
    results.tests.livePerformance = await this.checkLivePerformance();

    // Calculate overall score
    const testCount = Object.keys(results.tests).length;
    const passedTests = Object.values(results.tests).filter(test => test.success).length;
    results.overallScore = Math.round((passedTests / testCount) * 100);

    // Determine Marcus status
    if (results.overallScore >= 75) {
      results.marcusStatus = 'MAXIMUM_INTELLIGENCE';
      results.message = '🤖 Marcus AI at full capacity with live market intelligence!';
    } else if (results.overallScore >= 50) {
      results.marcusStatus = 'OPERATIONAL';
      results.message = '🤖 Marcus AI operational with most systems online';
    } else {
      results.marcusStatus = 'LIMITED';
      results.message = '🤖 Marcus AI running with limited capabilities';
    }

    console.log('🎯 Marcus Full Test Results:', results);
    return results;
  }
}

// Singleton instance
const statusService = new StatusService();

export default statusService;