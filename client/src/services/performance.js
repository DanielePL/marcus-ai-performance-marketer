// client/src/services/performance.js
// Frontend Service für Performance API Integration mit Marcus AI
// 🔥 PERFEKT OPTIMIERT - Basiert auf echten Backend-Routes & Response-Strukturen

class PerformanceService {
  constructor() {
    // 🔥 EXAKTE URL CONSTRUCTION (wie andere Services):
    this.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    this.apiEndpoint = `${this.baseURL}/api/performance`;  // Genau wie Backend: /api/performance
  }

  // 📊 Get Live Performance Data - ECHTE Backend-Route
  async getLiveData() {
    try {
      console.log('📊 Loading live performance data...');

      const response = await fetch(`${this.apiEndpoint}/live`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`Live data API failed: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        console.log('✅ Live performance data loaded:', data.data);
        return {
          success: true,
          data: data.data,
          message: data.message || 'Live data loaded successfully'
        };
      } else {
        throw new Error(data.error || data.message || 'Live data fetch failed');
      }

    } catch (error) {
      console.error('❌ Live performance data failed:', error);
      return {
        success: false,
        error: error.message,
        data: this.getFallbackLiveData()
      };
    }
  }

  // 📈 Get Dashboard Performance Data - ECHTE Backend-Route
  async getDashboardData(timeRange = '7d') {
    try {
      console.log(`📈 Loading dashboard data (${timeRange})...`);

      const response = await fetch(`${this.apiEndpoint}/dashboard?timeframe=${timeRange}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`Dashboard API failed: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        console.log('✅ Dashboard data loaded:', data.summary);
        return {
          success: true,
          data: data.summary,
          enhanced: data.enhanced,
          timeframe: data.timeframe,
          message: 'Dashboard data loaded successfully'
        };
      } else {
        throw new Error(data.error || data.message || 'Dashboard data fetch failed');
      }

    } catch (error) {
      console.error('❌ Dashboard data failed:', error);
      return {
        success: false,
        error: error.message,
        data: this.getFallbackDashboardData()
      };
    }
  }

  // 📊 Get Campaign Performance - ECHTE Backend-Route
  async getCampaignPerformance(campaignId, timeRange = '7d') {
    try {
      console.log(`📊 Loading campaign performance for ${campaignId}...`);

      const response = await fetch(`${this.apiEndpoint}/campaigns/${campaignId}?timeframe=${timeRange}&granularity=daily`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`Campaign performance API failed: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        console.log('✅ Campaign performance loaded');
        return {
          success: true,
          data: {
            campaign: data.campaign,
            metrics: data.metrics,
            keywordPerformance: data.keywordPerformance,
            adPerformance: data.adPerformance,
            timeframe: data.timeframe
          }
        };
      } else {
        throw new Error(data.error || data.message || 'Campaign performance fetch failed');
      }

    } catch (error) {
      console.error('❌ Campaign performance failed:', error);
      return {
        success: false,
        error: error.message,
        data: null
      };
    }
  }

  // 🔄 Get Real-time Performance Data - ECHTE Backend-Route
  async getRealTimeData() {
    try {
      console.log('⚡ Loading real-time performance data...');

      const response = await fetch(`${this.apiEndpoint}/realtime`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`Real-time API failed: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        console.log('✅ Real-time data loaded');
        return {
          success: true,
          data: data.data,
          enhanced: data.enhanced,
          message: 'Real-time data loaded successfully'
        };
      } else {
        throw new Error(data.error || data.message || 'Real-time data fetch failed');
      }

    } catch (error) {
      console.error('❌ Real-time data failed:', error);
      return {
        success: false,
        error: error.message,
        data: this.getFallbackRealTimeData()
      };
    }
  }

  // 📈 Get Hourly Trends - ECHTE Backend-Route
  async getHourlyTrends() {
    try {
      console.log('📈 Loading hourly performance trends...');

      const response = await fetch(`${this.apiEndpoint}/trends/hourly`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`Hourly trends API failed: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        console.log('✅ Hourly trends loaded:', data.dataPoints, 'data points');
        return {
          success: true,
          data: data.trends,
          dataPoints: data.dataPoints,
          message: 'Hourly trends loaded successfully'
        };
      } else {
        throw new Error(data.error || data.message || 'Hourly trends fetch failed');
      }

    } catch (error) {
      console.error('❌ Hourly trends failed:', error);
      return {
        success: false,
        error: error.message,
        data: []
      };
    }
  }

  // 🔍 Get Platform Status - ECHTE Backend-Route
  async getPlatformStatus() {
    try {
      console.log('🔍 Loading platform connection status...');

      const response = await fetch(`${this.apiEndpoint}/status`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`Platform status API failed: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        console.log('✅ Platform status loaded');
        return {
          success: true,
          data: {
            serviceStatus: data.serviceStatus,
            platforms: data.platforms,
            connectedPlatforms: data.connectedPlatforms
          },
          message: 'Platform status loaded successfully'
        };
      } else {
        throw new Error(data.error || data.message || 'Platform status fetch failed');
      }

    } catch (error) {
      console.error('❌ Platform status failed:', error);
      return {
        success: false,
        error: error.message,
        data: this.getFallbackPlatformStatus()
      };
    }
  }

  // 🧪 Test Platform Connection - ECHTE Backend-Route
  async testConnection(platform = 'google') {
    try {
      console.log(`🧪 Testing ${platform} connection...`);

      const response = await fetch(`${this.apiEndpoint}/test-connection/${platform}`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          testType: 'connection',
          timestamp: new Date().toISOString()
        })
      });

      if (!response.ok) {
        throw new Error(`Connection test failed: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        console.log('✅ Connection test successful:', data.connectionResult);
        return {
          success: true,
          status: data.connectionResult.status,
          platform: data.connectionResult.platform,
          message: data.connectionResult.message
        };
      } else {
        throw new Error(data.error || data.message || 'Connection test failed');
      }

    } catch (error) {
      console.error('❌ Connection test failed:', error);
      return {
        success: false,
        status: 'error',
        error: error.message
      };
    }
  }

  // 🔄 Force Sync Campaign - ECHTE Backend-Route
  async forceSyncCampaign(campaignId) {
    try {
      console.log(`🔄 Force syncing campaign ${campaignId}...`);

      const response = await fetch(`${this.apiEndpoint}/force-sync/${campaignId}`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          campaignId: campaignId,
          syncType: 'full',
          timestamp: new Date().toISOString()
        })
      });

      if (!response.ok) {
        throw new Error(`Force sync failed: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        console.log('✅ Force sync completed');
        return {
          success: true,
          data: data.syncResult,
          message: data.message || 'Campaign synced successfully'
        };
      } else {
        throw new Error(data.error || data.message || 'Force sync failed');
      }

    } catch (error) {
      console.error('❌ Force sync failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // 📋 Sync Platform Data - ECHTE Backend-Route
  async syncPlatformData(platform) {
    try {
      console.log(`📋 Syncing ${platform} data...`);

      const response = await fetch(`${this.apiEndpoint}/sync/${platform}`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          platform: platform,
          timestamp: new Date().toISOString()
        })
      });

      if (!response.ok) {
        throw new Error(`Platform sync failed: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        console.log('✅ Platform sync completed:', data.synced, 'campaigns synced');
        return {
          success: true,
          synced: data.synced,
          total: data.total,
          message: data.message,
          errors: data.errors
        };
      } else {
        throw new Error(data.error || data.message || 'Platform sync failed');
      }

    } catch (error) {
      console.error('❌ Platform sync failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // 📊 Get Performance Trends - ECHTE Backend-Route
  async getPerformanceTrends(timeframe = '30d', metric = 'spend') {
    try {
      console.log(`📊 Loading performance trends (${timeframe}, ${metric})...`);

      const response = await fetch(`${this.apiEndpoint}/trends?timeframe=${timeframe}&metric=${metric}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`Trends API failed: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        console.log('✅ Performance trends loaded');
        return {
          success: true,
          data: {
            trends: data.trends,
            analysis: data.analysis
          }
        };
      } else {
        throw new Error(data.error || data.message || 'Trends fetch failed');
      }

    } catch (error) {
      console.error('❌ Performance trends failed:', error);
      return {
        success: false,
        error: error.message,
        data: { trends: [], analysis: null }
      };
    }
  }

  // 🎯 Get Performance Alerts - ECHTE Backend-Route
  async getPerformanceAlerts(severity = null, acknowledged = false) {
    try {
      console.log('🎯 Loading performance alerts...');

      const params = new URLSearchParams();
      if (severity) params.append('severity', severity);
      params.append('acknowledged', acknowledged.toString());

      const response = await fetch(`${this.apiEndpoint}/alerts?${params.toString()}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`Alerts API failed: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        console.log('✅ Performance alerts loaded:', data.total, 'alerts');
        return {
          success: true,
          data: data.alerts,
          total: data.total
        };
      } else {
        throw new Error(data.error || data.message || 'Alerts fetch failed');
      }

    } catch (error) {
      console.error('❌ Performance alerts failed:', error);
      return {
        success: false,
        error: error.message,
        data: []
      };
    }
  }

  // ✅ Acknowledge Alert - ECHTE Backend-Route
  async acknowledgeAlert(alertId) {
    try {
      console.log(`✅ Acknowledging alert ${alertId}...`);

      const response = await fetch(`${this.apiEndpoint}/alerts/${alertId}/acknowledge`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          alertId: alertId,
          timestamp: new Date().toISOString()
        })
      });

      if (!response.ok) {
        throw new Error(`Acknowledge failed: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        console.log('✅ Alert acknowledged');
        return {
          success: true,
          message: data.message || 'Alert acknowledged successfully'
        };
      } else {
        throw new Error(data.error || data.message || 'Acknowledge failed');
      }

    } catch (error) {
      console.error('❌ Acknowledge alert failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // 🛡️ FALLBACK DATA (passend zur Backend-Struktur)
  getFallbackLiveData() {
    return {
      totals: {
        spend: 0,
        impressions: 0,
        clicks: 0,
        conversions: 0,
        roas: 0,
        ctr: 0,
        cpc: 0,
        revenue: 0
      },
      platforms: {
        google_ads: {
          status: 'offline',
          data: { spend: 0, impressions: 0, clicks: 0, conversions: 0 }
        },
        meta_ads: {
          status: 'offline',
          data: { spend: 0, impressions: 0, clicks: 0, conversions: 0 }
        }
      },
      campaigns: [],
      serviceStatus: {
        status: 'offline',
        message: 'API connection failed - showing fallback data'
      },
      totalActiveCampaigns: 0,
      lastUpdated: new Date().toISOString()
    };
  }

  getFallbackDashboardData() {
    return {
      totalCampaigns: 0,
      activeCampaigns: 0,
      totalSpend: 0,
      totalImpressions: 0,
      totalClicks: 0,
      totalConversions: 0,
      averageCTR: 0,
      averageCPC: 0,
      averageROAS: 0,
      platformBreakdown: {},
      statusBreakdown: {},
      dailyPerformance: [],
      liveStatus: null,
      lastUpdated: new Date().toISOString(),
      status: 'offline'
    };
  }

  getFallbackRealTimeData() {
    return {
      totalActiveCampaigns: 0,
      totalSpendToday: 0,
      totalImpressionsToday: 0,
      totalClicksToday: 0,
      totalConversionsToday: 0,
      platforms: {},
      alerts: [],
      topPerformingCampaigns: [],
      underperformingCampaigns: [],
      serviceStatus: { status: 'offline' }
    };
  }

  getFallbackPlatformStatus() {
    return {
      serviceStatus: { status: 'offline' },
      platforms: {
        google_ads: { status: 'offline' },
        meta_ads: { status: 'offline' }
      },
      connectedPlatforms: 0
    };
  }

  // 🔧 AUTH HEADERS (exakt wie andere Services)
  getAuthHeaders() {
    const token = localStorage.getItem('marcus_auth_token');
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    };
  }

  // 📊 UTILITY FUNCTIONS (wie andere Services)
  formatCurrency(value, currency = 'EUR') {
    return new Intl.NumberFormat('de-CH', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value || 0);
  }

  formatPercentage(value, decimals = 2) {
    return `${(value || 0).toFixed(decimals)}%`;
  }

  formatNumber(value) {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value?.toLocaleString() || '0';
  }

  getPerformanceColor(value, type = 'change') {
    if (type === 'change') {
      if (value > 5) return 'text-green-500';
      if (value < -5) return 'text-red-500';
      return 'text-yellow-500';
    }

    if (type === 'roas') {
      if (value >= 3) return 'text-green-500';
      if (value >= 2) return 'text-yellow-500';
      return 'text-red-500';
    }

    return 'text-gray-500';
  }

  // 🔧 Service Health Check
  async checkServiceHealth() {
    try {
      const response = await this.testConnection('google');
      return {
        healthy: response.success,
        status: response.status,
        message: response.message || response.error,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        healthy: false,
        status: 'error',
        message: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
}

// Singleton instance
const performanceService = new PerformanceService();

export default performanceService;