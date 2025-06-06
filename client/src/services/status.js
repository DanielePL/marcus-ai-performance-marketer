// client/src/services/status.js
// Marcus AI - Comprehensive Status & Intelligence Service
// 🔥 VOLLSTÄNDIG REPARIERT - Nur existierende Server-Routes verwenden

class StatusService {
  constructor() {
    // 🔥 KORREKTE URL CONSTRUCTION:
    this.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    this.apiBase = `${this.baseURL}/api`;  // Korrekt: /api als base
  }

  // Get comprehensive server status including Google Ads Intelligence
  async getServerStatus() {
    try {
      console.log('🔍 Marcus checking comprehensive system status...');

      const response = await fetch(`${this.apiBase}/status`);
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

  // 🔥 REPARIERT: Get live performance data from all platforms
  async getLivePerformance() {
    try {
      console.log('📊 Marcus fetching live performance data...');

      const response = await fetch(`${this.apiBase}/performance/live`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Live performance data received');
      return { success: true, data };
    } catch (error) {
      console.error('❌ Live performance error:', error);
      return { success: false, error: error.message };
    }
  }

  // 🔥 REPARIERT: Get platform connection status
  async getPlatformStatus() {
    try {
      console.log('🔍 Marcus checking platform connection status...');

      const response = await fetch(`${this.apiBase}/performance/status`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Platform status received');
      return { success: true, data };
    } catch (error) {
      console.error('❌ Platform status error:', error);
      return { success: false, error: error.message };
    }
  }

  // 🔥 REPARIERT: Test Google Ads connection
  async testGoogleAdsConnection() {
    try {
      console.log('🔌 Marcus testing Google Ads API connection...');

      const response = await fetch(`${this.apiBase}/performance/test-connection/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          testType: 'connection',
          timestamp: new Date().toISOString()
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

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

  // 🔥 REPARIERT: Get hourly performance trends
  async getHourlyTrends() {
    try {
      console.log('📈 Marcus fetching hourly performance trends...');

      const response = await fetch(`${this.apiBase}/performance/trends/hourly`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Hourly trends received');
      return { success: true, data };
    } catch (error) {
      console.error('❌ Hourly trends error:', error);
      return { success: false, error: error.message };
    }
  }

  // 🔥 REPARIERT: Force sync campaign data
  async forceSyncCampaign(campaignId) {
    try {
      console.log(`🔄 Marcus forcing sync for campaign: ${campaignId}`);

      const response = await fetch(`${this.apiBase}/performance/force-sync/${campaignId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          campaignId: campaignId,
          syncType: 'full',
          timestamp: new Date().toISOString()
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Force sync completed');
      return { success: true, data };
    } catch (error) {
      console.error('❌ Force sync error:', error);
      return { success: false, error: error.message };
    }
  }

  // 🔥 NEW: Test Market Intelligence capabilities (using Google Ads service)
  async testMarketIntelligence() {
    try {
      console.log('🧠 Marcus testing Market Intelligence capabilities...');

      // Test keyword research via Google Ads API
      const keywordTest = await fetch(`${this.apiBase}/google-ads/test-connection`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          testType: 'market-intelligence',
          timestamp: new Date().toISOString()
        })
      });
      const keywordData = await keywordTest.json();

      // Check if Google Ads service is available for market intelligence
      const intelligence = {
        keywordResearch: keywordData.success,
        marketIntelligence: keywordData.success,
        capabilities: keywordData.success ? [
          'Keyword Research',
          'Competition Analysis',
          'Market Intelligence',
          'Industry Benchmarks'
        ] : [],
        intelligenceLevel: keywordData.success ? 'advanced' : 'offline'
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

  // Get system health check
  async getSystemHealth() {
    try {
      const [serverStatus, platformStatus] = await Promise.all([
        this.getServerStatus(),
        this.getPlatformStatus()
      ]);

      return {
        server: serverStatus,
        platforms: platformStatus,
        overall: this.calculateOverallHealth(serverStatus, platformStatus),
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ System health check error:', error);
      return {
        server: { success: false, error: error.message },
        platforms: { success: false, error: error.message },
        overall: 'error',
        timestamp: new Date().toISOString()
      };
    }
  }

  // Calculate overall system health
  calculateOverallHealth(serverStatus, platformStatus) {
    if (!serverStatus?.success || !platformStatus?.success) return 'error';

    const serverOk = serverStatus.data?.status === 'operational';
    const googleOk = platformStatus.data?.platforms?.google?.status === 'connected';
    const metaOk = platformStatus.data?.platforms?.meta?.status === 'connected';

    if (serverOk && googleOk && metaOk) return 'excellent';
    if (serverOk && (googleOk || metaOk)) return 'good';
    if (serverOk) return 'limited';
    return 'error';
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
    const token = localStorage.getItem('marcus_auth_token') || 'dev-marcus-token-2025';
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  // 🔥 REPARIERT: Quick system health check (using correct route)
  async quickHealthCheck() {
    try {
      const healthResponse = await fetch(`${this.apiBase}/status`);  // Geändert von /api/health zu /api/status
      const healthData = await healthResponse.json();

      return {
        success: healthData.status === 'operational',
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
    results.tests.livePerformance = await this.getLivePerformance();

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