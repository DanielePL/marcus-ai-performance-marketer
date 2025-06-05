// client/src/components/Marcus.jsx
// MARCUS AI ENHANCED - Complete Integration mit Dashboard, Campaign Manager & Enhanced Chat
import React, { useState, useEffect, useRef } from 'react';
import openaiService from '../services/openai.js';
import statusService from '../services/status.js';
import CampaignCreator from './campaigns/CampaignCreator.jsx';
import PerformanceDashboard from './dashboard/PerformanceDashboard.jsx';
import CampaignManager from './campaigns/CampaignManager.jsx';
import MarcusChat from './ai/MarcusChat.jsx';

const Marcus = () => {
  // CORE STATE - Original functionality
  const [isIntroComplete, setIsIntroComplete] = useState(false);
  const [showCampaignCreator, setShowCampaignCreator] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [systemStatus, setSystemStatus] = useState('initializing');
  const [serverStatus, setServerStatus] = useState(null);
  const [marcusIntelligence, setMarcusIntelligence] = useState(null);

  // ENHANCED STATE - New features
  const [activeView, setActiveView] = useState('dashboard'); // 'dashboard', 'campaigns', 'chat', 'settings'
  const [performanceData, setPerformanceData] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [realTimeMetrics, setRealTimeMetrics] = useState({});

  // CHAT STATE - For chat view
  const [chatMessages, setChatMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const chatContainerRef = useRef(null);

  // INITIALIZE MARCUS ENHANCED
  useEffect(() => {
    initializeMarcusEnhanced();
  }, []);

  const initializeMarcusEnhanced = async () => {
    try {
      console.log('🚀 Starting Enhanced Marcus initialization...');
      setSystemStatus('connecting_ai');

      // Check Server Status first using your status service
      const serverStatusResult = await statusService.getServerStatus();
      if (serverStatusResult.success) {
        const formattedStatus = statusService.formatStatusForMarcus(serverStatusResult);
        const intelligenceSummary = statusService.getMarcusIntelligenceSummary(serverStatusResult.data);

        setServerStatus(formattedStatus);
        setMarcusIntelligence(intelligenceSummary);

        console.log('📊 Server Status:', formattedStatus);
        console.log('🧠 Marcus Intelligence:', intelligenceSummary);
      }

      // Check OpenAI API key
      const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
      console.log('🔑 API Key check:', apiKey ? 'EXISTS' : 'MISSING');

      if (!apiKey) {
        console.error('❌ No OpenAI API Key found!');
        setConnectionStatus('error');
        setSystemStatus('ai_offline');
        addNotification('❌ AI CORE OFFLINE - VITE_OPENAI_API_KEY fehlt in .env file!', 'error');
        return;
      }

      // Test OpenAI Connection
      console.log('🔌 Testing OpenAI connection...');
      const aiConnection = await openaiService.testConnection();
      console.log('🔌 Connection result:', aiConnection);

      if (aiConnection.status === 'connected') {
        console.log('✅ OpenAI connected successfully!');
        setConnectionStatus('online');
        setSystemStatus('ai_ready');

        // Initialize chat with welcome message
        const welcomeMessage = marcusIntelligence?.level === 'maximum' ?
          'Begrüße den User kurz als Marcus mit VOLLSTÄNDIGER Market Intelligence. Erwähne dass du Zugang zu echten Google Ads Marktdaten hast.' :
          'Begrüße den User kurz als Marcus. Sage dass du bereit bist für Performance Marketing.';

        const welcomeResponse = await openaiService.chatWithMarcus(welcomeMessage);

        if (welcomeResponse.success) {
          setChatMessages([{
            id: Date.now(),
            type: 'marcus',
            content: welcomeResponse.response,
            timestamp: new Date().toISOString()
          }]);
        }

        // Load enhanced data
        await loadEnhancedData();
        setSystemStatus('mission_active');
        addNotification('🤖 Marcus AI Enhanced - Vollständig operational!', 'success');

      } else {
        console.error('❌ OpenAI connection failed:', aiConnection);
        setConnectionStatus('error');
        setSystemStatus('ai_offline');
        addNotification(`❌ AI CORE OFFLINE - ${aiConnection.message || 'Connection failed'}`, 'error');
      }
    } catch (error) {
      console.error('🚨 Enhanced Marcus Initialization Failed:', error);
      setConnectionStatus('error');
      setSystemStatus('system_error');
      addNotification(`🚨 SYSTEM ERROR: ${error.message}`, 'error');
    }
  };

  // LOAD ENHANCED DATA
  const loadEnhancedData = async () => {
    try {
      console.log('📊 Loading enhanced performance data...');

      // Load performance data (TODO: Replace with real API calls)
      setPerformanceData({
        roas: 2.34,
        ctr: 2.8,
        cpc: 1.23,
        spend: 1247.50,
        conversions: 142,
        impressions: 45230,
        clicks: 1267,
        revenue: 2918.45,
        lastUpdated: new Date().toISOString(),
        isLive: true
      });

      // Load campaigns (TODO: Replace with real API calls)
      setCampaigns([
        {
          id: '1',
          name: 'Summer Sale 2025',
          platform: 'google',
          status: 'active',
          objective: 'conversions',
          budget: { dailyBudget: 150 },
          metrics: {
            roas: 3.2,
            spend: 456.78,
            ctr: 3.4,
            conversions: 23,
            impressions: 12450,
            clicks: 423
          },
          createdAt: new Date().toISOString()
        },
        {
          id: '2',
          name: 'Brand Awareness Q2',
          platform: 'meta',
          status: 'active',
          objective: 'brand_awareness',
          budget: { dailyBudget: 100 },
          metrics: {
            roas: 1.8,
            spend: 234.56,
            ctr: 2.1,
            conversions: 8,
            impressions: 18230,
            clicks: 383
          },
          createdAt: new Date().toISOString()
        }
      ]);

      console.log('✅ Enhanced data loaded successfully');

    } catch (error) {
      console.error('❌ Enhanced data loading failed:', error);
      addNotification('⚠️ Daten-Loading teilweise fehlgeschlagen', 'warning');
    }
  };

  // ADD NOTIFICATION
  const addNotification = (message, type = 'info') => {
    const notification = {
      id: Date.now(),
      message,
      type,
      timestamp: new Date().toISOString()
    };

    setNotifications(prev => [notification, ...prev.slice(0, 4)]); // Keep last 5

    // Auto-remove after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
    }, 5000);
  };

  // HANDLE CAMPAIGN ACTIONS
  const handleCampaignAction = async (action, campaign = null) => {
    console.log('🎯 Campaign Action:', action, campaign);

    switch (action) {
      case 'optimize_all':
        console.log('⚡ Optimizing all campaigns...');
        addNotification('🤖 Marcus optimiert alle Campaigns...', 'info');
        // TODO: API call to optimize all campaigns
        break;

      case 'optimize':
        console.log('⚡ Optimizing campaign:', campaign?.name);
        addNotification(`🤖 Marcus optimiert "${campaign?.name}"...`, 'info');
        // TODO: API call to optimize specific campaign
        break;

      case 'pause':
        console.log('⏸ Pausing campaign:', campaign?.name);
        if (campaign) {
          setCampaigns(prev => prev.map(c =>
            c.id === campaign.id ? { ...c, status: 'paused' } : c
          ));
          addNotification(`Campaign "${campaign.name}" pausiert`, 'info');
        }
        break;

      case 'activate':
        console.log('▶ Activating campaign:', campaign?.name);
        if (campaign) {
          setCampaigns(prev => prev.map(c =>
            c.id === campaign.id ? { ...c, status: 'active' } : c
          ));
          addNotification(`Campaign "${campaign.name}" aktiviert`, 'success');
        }
        break;

      default:
        console.log('Unknown action:', action);
    }
  };

  // NAVIGATION ITEMS
  const navigationItems = [
    { id: 'dashboard', name: 'Dashboard', icon: '📊', description: 'Performance Overview' },
    { id: 'campaigns', name: 'Campaigns', icon: '🚀', description: 'Campaign Management' },
    { id: 'chat', name: 'Marcus AI', icon: '🤖', description: 'AI Assistant' },
    { id: 'settings', name: 'Settings', icon: '⚙️', description: 'System Settings' }
  ];

  // CHAT FUNCTIONS (for chat view)
  const handleSendMessage = async () => {
    if (!userInput.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: userInput.trim(),
      timestamp: new Date().toISOString()
    };

    setChatMessages(prev => [...prev, userMessage]);
    setUserInput('');
    setIsLoading(true);

    try {
      const context = {
        campaigns,
        performance: performanceData,
        systemStatus,
        marketIntelligence: marcusIntelligence
      };

      const response = await openaiService.chatWithMarcus(userMessage.content, context);

      const marcusMessage = {
        id: Date.now() + 1,
        type: 'marcus',
        content: response.success ? response.response : response.error,
        timestamp: new Date().toISOString(),
        usage: response.usage,
        success: response.success
      };

      setChatMessages(prev => [...prev, marcusMessage]);

    } catch (error) {
      console.error('❌ AI Chat Error:', error);
      setChatMessages(prev => [...prev, {
        id: Date.now() + 1,
        type: 'marcus',
        content: '🔧 NEURAL LINK STÖRUNG - Verbindung wird wiederhergestellt...',
        timestamp: new Date().toISOString(),
        success: false
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // STATUS HELPERS
  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'online': return '#00ff41';
      case 'connecting': return '#ffaa00';
      case 'error': return '#ff0040';
      default: return '#666';
    }
  };

  const getSystemStatusText = () => {
    switch (systemStatus) {
      case 'initializing': return 'SYSTEM BOOT...';
      case 'connecting_ai': return 'AI CORE LINKING...';
      case 'ai_ready': return 'AI ONLINE';
      case 'mission_active': return 'MISSION ACTIVE';
      case 'ai_offline': return 'AI OFFLINE';
      case 'system_error': return 'SYSTEM ERROR';
      default: return 'STANDBY';
    }
  };

  // AUTO SCROLL CHAT
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  // TERMINATOR INTRO SEQUENCE
  if (!isIntroComplete) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'linear-gradient(45deg, #000 0%, #111 50%, #000 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Courier New, monospace',
        color: '#00ff41',
        overflow: 'hidden'
      }}>
        <div style={{ textAlign: 'center', position: 'relative' }}>
          <div style={{
            fontSize: '3rem',
            fontWeight: 'bold',
            textShadow: '0 0 20px #00ff41',
            animation: 'glitch 2s infinite, focus 3s ease-out forwards',
            filter: 'blur(2px)'
          }}>
            MARCUS AI ENHANCED
          </div>
          <div style={{
            fontSize: '1.5rem',
            marginTop: '20px',
            animation: 'typewriter 2s steps(30) 1s forwards',
            width: '0',
            overflow: 'hidden',
            whiteSpace: 'nowrap'
          }}>
            NEXT-LEVEL PERFORMANCE MARKETING
          </div>
          <div style={{
            marginTop: '40px',
            fontSize: '1rem',
            opacity: 0,
            animation: 'fadeIn 1s ease-in 3s forwards'
          }}>
            SYSTEM STATUS: {getSystemStatusText()}
          </div>
          <button
            onClick={() => setIsIntroComplete(true)}
            style={{
              marginTop: '40px',
              padding: '15px 30px',
              background: 'transparent',
              border: '2px solid #00ff41',
              color: '#00ff41',
              fontFamily: 'Courier New, monospace',
              fontSize: '1rem',
              cursor: 'pointer',
              opacity: 0,
              animation: 'fadeIn 1s ease-in 4s forwards',
              textTransform: 'uppercase',
              letterSpacing: '2px'
            }}
          >
            LAUNCH_ENHANCED_INTERFACE
          </button>
        </div>

        <style>{`
          @keyframes glitch {
            0% { transform: translate(0) }
            20% { transform: translate(-2px, 2px) }
            40% { transform: translate(-2px, -2px) }
            60% { transform: translate(2px, 2px) }
            80% { transform: translate(2px, -2px) }
            100% { transform: translate(0) }
          }
          @keyframes focus {
            0% { filter: blur(2px); }
            100% { filter: blur(0px); }
          }
          @keyframes typewriter {
            from { width: 0 }
            to { width: 100% }
          }
          @keyframes fadeIn {
            to { opacity: 1 }
          }
        `}</style>
      </div>
    );
  }

  // MAIN ENHANCED INTERFACE
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #0a0a0a 100%)',
      fontFamily: 'Courier New, monospace',
      color: '#00ff41',
      position: 'relative',
      overflow: 'hidden'
    }}>

      {/* NOTIFICATIONS */}
      {notifications.length > 0 && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}>
          {notifications.map(notification => (
            <div
              key={notification.id}
              style={{
                padding: '12px 16px',
                background: notification.type === 'error' ? 'rgba(255,0,64,0.9)' :
                           notification.type === 'warning' ? 'rgba(255,170,0,0.9)' :
                           notification.type === 'success' ? 'rgba(0,255,65,0.9)' :
                           'rgba(0,153,255,0.9)',
                color: notification.type === 'success' ? '#000' : '#fff',
                borderRadius: '8px',
                fontSize: '0.9rem',
                fontWeight: 'bold',
                minWidth: '300px',
                animation: 'slideIn 0.3s ease-out',
                cursor: 'pointer'
              }}
              onClick={() => setNotifications(prev => prev.filter(n => n.id !== notification.id))}
            >
              {notification.message}
            </div>
          ))}
        </div>
      )}

      {/* GRID BACKGROUND */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundImage: `
          linear-gradient(rgba(0,255,65,0.1) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0,255,65,0.1) 1px, transparent 1px)
        `,
        backgroundSize: '30px 30px',
        animation: 'gridPulse 4s ease-in-out infinite',
        zIndex: 1
      }} />

      {/* MAIN LAYOUT */}
      <div style={{
        position: 'relative',
        zIndex: 2,
        display: 'flex',
        minHeight: '100vh'
      }}>

        {/* SIDEBAR NAVIGATION */}
        <div style={{
          width: '280px',
          background: 'rgba(0,255,65,0.1)',
          border: '1px solid #00ff41',
          borderRadius: '0 15px 15px 0',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}>

          {/* LOGO */}
          <div style={{
            textAlign: 'center',
            marginBottom: '30px',
            paddingBottom: '20px',
            borderBottom: '1px solid #00ff41'
          }}>
            <h1 style={{
              margin: 0,
              fontSize: '1.5rem',
              textShadow: '0 0 10px #00ff41'
            }}>
              🤖 MARCUS AI
            </h1>
            <div style={{
              fontSize: '0.8rem',
              opacity: 0.8,
              marginTop: '5px'
            }}>
              Enhanced Interface
            </div>
            <div style={{
              fontSize: '0.7rem',
              opacity: 0.6,
              marginTop: '3px'
            }}>
              v2.0 • {marcusIntelligence?.level || 'Unknown'} Intelligence
            </div>
          </div>

          {/* SYSTEM STATUS */}
          <div style={{
            padding: '12px',
            background: 'rgba(0,0,0,0.3)',
            borderRadius: '8px',
            border: '1px solid #333',
            marginBottom: '20px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '8px'
            }}>
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: getStatusColor(),
                animation: connectionStatus === 'online' ? 'pulse 2s infinite' : 'none'
              }} />
              <span style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>
                {getSystemStatusText()}
              </span>
            </div>
            {marcusIntelligence && (
              <div style={{ fontSize: '0.7rem', opacity: 0.8 }}>
                Intelligence: {marcusIntelligence.score}% ({marcusIntelligence.capabilities.length} active)
              </div>
            )}
          </div>

          {/* NAVIGATION */}
          {navigationItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              style={{
                width: '100%',
                padding: '15px',
                background: activeView === item.id ? 'rgba(0,255,65,0.3)' : 'transparent',
                border: activeView === item.id ? '2px solid #00ff41' : '1px solid #333',
                color: '#00ff41',
                borderRadius: '8px',
                cursor: 'pointer',
                fontFamily: 'Courier New, monospace',
                fontSize: '0.9rem',
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                transition: 'all 0.3s ease'
              }}
              title={item.description}
            >
              <span style={{ fontSize: '1.2rem' }}>{item.icon}</span>
              <div>
                <div>{item.name}</div>
                <div style={{ fontSize: '0.7rem', opacity: 0.6 }}>
                  {item.description}
                </div>
              </div>
            </button>
          ))}

          {/* QUICK STATS */}
          <div style={{
            marginTop: 'auto',
            padding: '15px',
            background: 'rgba(0,0,0,0.3)',
            borderRadius: '8px',
            border: '1px solid #333'
          }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '10px' }}>
              📈 QUICK STATS
            </div>
            <div style={{ fontSize: '0.7rem', lineHeight: '1.4' }}>
              <div>Active Campaigns: {campaigns.filter(c => c.status === 'active').length}</div>
              <div>Total Spend: €{(performanceData?.spend || 0).toFixed(2)}</div>
              <div>Average ROAS: {(performanceData?.roas || 0).toFixed(2)}x</div>
              <div>Last Update: {performanceData?.lastUpdated ?
                new Date(performanceData.lastUpdated).toLocaleTimeString() : 'Never'}</div>
            </div>
          </div>
        </div>

        {/* MAIN CONTENT AREA */}
        <div style={{
          flex: 1,
          padding: '20px',
          overflowY: 'auto'
        }}>

          {/* HEADER */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '30px',
            paddingBottom: '15px',
            borderBottom: '1px solid #00ff41'
          }}>
            <div>
              <h2 style={{
                margin: 0,
                fontSize: '1.8rem',
                textShadow: '0 0 10px #00ff41'
              }}>
                {activeView === 'dashboard' && '📊 PERFORMANCE DASHBOARD'}
                {activeView === 'campaigns' && '🚀 CAMPAIGN MANAGEMENT'}
                {activeView === 'chat' && '🤖 MARCUS AI CHAT'}
                {activeView === 'settings' && '⚙️ SYSTEM SETTINGS'}
              </h2>
              <div style={{ fontSize: '0.9rem', opacity: 0.7, marginTop: '5px' }}>
                {activeView === 'dashboard' && 'Live performance monitoring & analytics'}
                {activeView === 'campaigns' && 'Advanced campaign management & optimization'}
                {activeView === 'chat' && 'AI-powered marketing assistant with market intelligence'}
                {activeView === 'settings' && 'System configuration & intelligence status'}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              {/* Quick Actions */}
              <button
                onClick={async () => {
                  const testResult = await statusService.testGoogleAdsConnection();
                  addNotification(
                    testResult.success ?
                      '✅ Google Ads API connection successful!' :
                      `❌ Google Ads API failed: ${testResult.error}`,
                    testResult.success ? 'success' : 'error'
                  );
                }}
                style={{
                  padding: '8px 12px',
                  background: 'transparent',
                  border: '1px solid #0099ff',
                  color: '#0099ff',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontFamily: 'Courier New, monospace',
                  fontSize: '0.8rem'
                }}
              >
                🔍 TEST APIS
              </button>

              {/* Fullscreen Toggle */}
              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                style={{
                  padding: '8px 12px',
                  background: 'transparent',
                  border: '1px solid #00ff41',
                  color: '#00ff41',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontFamily: 'Courier New, monospace',
                  fontSize: '0.8rem'
                }}
              >
                {isFullscreen ? '🗗 EXIT' : '🗖 FULL'}
              </button>
            </div>
          </div>

          {/* DYNAMIC CONTENT BASED ON ACTIVE VIEW */}
          {activeView === 'dashboard' && (
            <PerformanceDashboard
              isVisible={true}
              campaigns={campaigns}
              realTimeData={realTimeMetrics}
            />
          )}

          {activeView === 'campaigns' && (
            <CampaignManager
              campaigns={campaigns}
              onCampaignUpdate={(campaign) => {
                setCampaigns(prev => prev.map(c => c.id === campaign.id ? campaign : c));
                addNotification(`Campaign "${campaign.name}" updated`, 'success');
              }}
              onCampaignDelete={(campaignId) => {
                setCampaigns(prev => prev.filter(c => c.id !== campaignId));
                addNotification('Campaign deleted', 'info');
              }}
              onCampaignOptimize={(campaign) => {
                handleCampaignAction('optimize', campaign);
              }}
            />
          )}

          {activeView === 'chat' && (
            <div style={{ display: 'flex', gap: '20px', height: '600px' }}>
              {/* Enhanced Chat Component */}
              <div style={{ flex: 1 }}>
                <MarcusChat
                  isVisible={true}
                  campaigns={campaigns}
                  performanceData={performanceData}
                  marketIntelligence={marcusIntelligence}
                  onCampaignAction={handleCampaignAction}
                />
              </div>

              {/* Chat Sidebar with additional info */}
              <div style={{
                width: '300px',
                background: 'rgba(0,255,65,0.1)',
                border: '1px solid #00ff41',
                borderRadius: '10px',
                padding: '20px'
              }}>
                <h3 style={{ margin: '0 0 15px 0', fontSize: '1.1rem' }}>
                  💡 MARCUS CAPABILITIES
                </h3>

                {marcusIntelligence && marcusIntelligence.capabilities.length > 0 && (
                  <div style={{ marginBottom: '20px' }}>
                    <div style={{ fontSize: '0.9rem', marginBottom: '10px', fontWeight: 'bold' }}>
                      🚀 Active Capabilities:
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                      {marcusIntelligence.capabilities.map((capability, index) => (
                        <div
                          key={index}
                          style={{
                            padding: '6px 10px',
                            background: 'rgba(0,255,65,0.2)',
                            borderRadius: '5px',
                            fontSize: '0.8rem',
                            border: '1px solid rgba(0,255,65,0.3)'
                          }}
                        >
                          ✓ {capability}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {serverStatus && (
                  <div style={{ marginBottom: '20px' }}>
                    <div style={{ fontSize: '0.9rem', marginBottom: '10px', fontWeight: 'bold' }}>
                      🔧 API Status:
                    </div>
                    <div style={{ fontSize: '0.8rem', lineHeight: '1.4' }}>
                      <div>AI Core: <span style={{ color: statusService.getStatusColor(serverStatus.apis?.openai) }}>
                        {statusService.getStatusText(serverStatus.apis?.openai)}
                      </span></div>
                      <div>Google Ads: <span style={{ color: statusService.getStatusColor(serverStatus.apis?.googleAds) }}>
                        {statusService.getStatusText(serverStatus.apis?.googleAds)}
                      </span></div>
                      <div>Database: <span style={{ color: statusService.getStatusColor(serverStatus.database) }}>
                        {statusService.getStatusText(serverStatus.database)}
                      </span></div>
                    </div>
                  </div>
                )}

                <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>
                  💬 Frage Marcus nach:
                  <ul style={{ margin: '8px 0', paddingLeft: '20px', lineHeight: '1.4' }}>
                    <li>Campaign Performance</li>
                    <li>Keyword Research</li>
                    <li>Budget Optimization</li>
                    <li>Competitor Analysis</li>
                    <li>Market Intelligence</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeView === 'settings' && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
              gap: '20px'
            }}>
              {/* System Status */}
              <div style={{
                background: 'rgba(0,255,65,0.1)',
                border: '1px solid #00ff41',
                borderRadius: '10px',
                padding: '20px'
              }}>
                <h3 style={{ margin: '0 0 15px 0' }}>🔧 SYSTEM STATUS</h3>
                <div style={{ fontSize: '0.9rem', lineHeight: '1.6' }}>
                  <div>Status: <span style={{ color: getStatusColor() }}>{connectionStatus.toUpperCase()}</span></div>
                  <div>System: {getSystemStatusText()}</div>
                  {serverStatus && (
                    <>
                      <div>Uptime: {statusService.formatUptime(serverStatus.system?.uptime)}</div>
                      <div>Memory: {statusService.formatMemory(serverStatus.system?.memory)}</div>
                      <div>Environment: {serverStatus.system?.environment || 'Unknown'}</div>
                    </>
                  )}
                </div>
              </div>

              {/* Marcus Intelligence */}
              {marcusIntelligence && (
                <div style={{
                  background: 'rgba(0,255,65,0.1)',
                  border: '1px solid #00ff41',
                  borderRadius: '10px',
                  padding: '20px'
                }}>
                  <h3 style={{ margin: '0 0 15px 0' }}>🧠 MARCUS INTELLIGENCE</h3>
                  <div style={{ fontSize: '0.9rem', lineHeight: '1.6' }}>
                    <div>Level: <span style={{
                      color: marcusIntelligence.level === 'maximum' ? '#00ff41' :
                             marcusIntelligence.level === 'limited' ? '#ffaa00' : '#ff0040',
                      fontWeight: 'bold'
                    }}>
                      {marcusIntelligence.level.toUpperCase()}
                    </span></div>
                    <div>Score: {marcusIntelligence.score}%</div>
                    <div>Capabilities: {marcusIntelligence.capabilities.length}</div>
                    <div style={{ marginTop: '10px', fontSize: '0.8rem', opacity: 0.8 }}>
                      {marcusIntelligence.description}
                    </div>
                  </div>
                </div>
              )}

              {/* API Configuration */}
              <div style={{
                background: 'rgba(0,255,65,0.1)',
                border: '1px solid #00ff41',
                borderRadius: '10px',
                padding: '20px'
              }}>
                <h3 style={{ margin: '0 0 15px 0' }}>🔌 API CONFIGURATION</h3>
                <div style={{ fontSize: '0.9rem', lineHeight: '1.6' }}>
                  <div>OpenAI: {import.meta.env.VITE_OPENAI_API_KEY ? '✅ Configured' : '❌ Missing'}</div>
                  <div>Google Ads: {process.env.GOOGLE_ADS_DEVELOPER_TOKEN ? '✅ Configured' : '⚠️ Check Server'}</div>
                  <div>Base URL: {import.meta.env.VITE_API_URL || 'http://localhost:3001'}</div>
                </div>

                <button
                  onClick={initializeMarcusEnhanced}
                  style={{
                    marginTop: '15px',
                    padding: '10px 20px',
                    background: '#00ff41',
                    color: '#000',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    fontFamily: 'Courier New, monospace',
                    fontWeight: 'bold'
                  }}
                >
                  🔄 RESTART MARCUS
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* FLOATING ACTION BUTTON */}
      <button
        onClick={() => setShowCampaignCreator(true)}
        style={{
          position: 'fixed',
          bottom: '30px',
          right: '30px',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: '#00ff41',
          color: '#000',
          border: 'none',
          fontSize: '1.5rem',
          cursor: 'pointer',
          boxShadow: '0 4px 20px rgba(0,255,65,0.5)',
          zIndex: 100,
          animation: 'float 3s ease-in-out infinite'
        }}
        title="Create New Campaign"
      >
        🚀
      </button>

      {/* CAMPAIGN CREATOR MODAL */}
      {showCampaignCreator && (
        <CampaignCreator
          onCampaignCreate={(campaign) => {
            setCampaigns(prev => [...prev, {
              ...campaign,
              id: Date.now().toString(),
              createdAt: new Date().toISOString(),
              metrics: {
                roas: 0,
                spend: 0,
                ctr: 0,
                conversions: 0,
                impressions: 0,
                clicks: 0
              }
            }]);
            setShowCampaignCreator(false);
            addNotification(`✅ Campaign "${campaign.name}" created successfully!`, 'success');

            // Switch to campaigns view to see the new campaign
            setActiveView('campaigns');
          }}
          onClose={() => setShowCampaignCreator(false)}
        />
      )}

      <style>{`
        @keyframes pulse {
          0% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.1); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes gridPulse {
          0% { opacity: 0.3; }
          50% { opacity: 0.6; }
          100% { opacity: 0.3; }
        }
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes glitch {
          0% { transform: translate(0) }
          20% { transform: translate(-2px, 2px) }
          40% { transform: translate(-2px, -2px) }
          60% { transform: translate(2px, 2px) }
          80% { transform: translate(2px, -2px) }
          100% { transform: translate(0) }
        }
        @keyframes focus {
          0% { filter: blur(2px); }
          100% { filter: blur(0px); }
        }
        @keyframes typewriter {
          from { width: 0 }
          to { width: 100% }
        }
        @keyframes fadeIn {
          to { opacity: 1 }
        }
      `}</style>
    </div>
  );
};

export default Marcus;