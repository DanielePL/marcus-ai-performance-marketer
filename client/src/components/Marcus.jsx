// client/src/components/Marcus.jsx
// LIVE API VERSION - Keine Mock-Daten!
import React, { useState, useEffect, useRef } from 'react';
import openaiService from '../services/openai.js';
import CampaignCreator from './campaigns/CampaignCreator.jsx';
import statusService from '../services/status.js';

const Marcus = () => {
  // REAL STATE - No Mock Data
  const [isIntroComplete, setIsIntroComplete] = useState(false);
  const [showCampaignCreator, setShowCampaignCreator] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [performanceData, setPerformanceData] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [systemStatus, setSystemStatus] = useState('initializing');
  const [serverStatus, setServerStatus] = useState(null);
  const [marcusIntelligence, setMarcusIntelligence] = useState(null);

  const chatContainerRef = useRef(null);

  // LIVE INITIALIZATION - Connect to Real APIs
  useEffect(() => {
    initializeMarcus();
  }, []);

  const initializeMarcus = async () => {
    try {
      console.log('🚀 Starting Marcus initialization...');
      setSystemStatus('connecting_ai');

      // Check Server Status first
      const serverStatusResult = await statusService.getServerStatus();
      if (serverStatusResult.success) {
        const formattedStatus = statusService.formatStatusForMarcus(serverStatusResult);
        const intelligenceSummary = statusService.getMarcusIntelligenceSummary(formattedStatus);

        setServerStatus(formattedStatus);
        setMarcusIntelligence(intelligenceSummary);

        console.log('📊 Server Status:', formattedStatus);
        console.log('🧠 Marcus Intelligence:', intelligenceSummary);
      }

      // Check if API key exists
      const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
      console.log('🔑 API Key check:', apiKey ? 'EXISTS' : 'MISSING');

      if (!apiKey) {
        console.error('❌ No OpenAI API Key found!');
        setConnectionStatus('error');
        setSystemStatus('ai_offline');
        setChatMessages([{
          type: 'marcus',
          content: '❌ AI CORE OFFLINE - VITE_OPENAI_API_KEY fehlt in .env file!',
          timestamp: new Date().toISOString()
        }]);
        return;
      }

      // Test OpenAI Connection LIVE
      console.log('🔌 Testing OpenAI connection...');
      const aiConnection = await openaiService.testConnection();
      console.log('🔌 Connection result:', aiConnection);

      if (aiConnection.status === 'connected') {
        console.log('✅ OpenAI connected successfully!');
        setConnectionStatus('online');
        setSystemStatus('ai_ready');

        // Send Initial AI Message with intelligence info
        const welcomeMessage = marcusIntelligence?.level === 'maximum' ?
          'Begrüße den User kurz als Marcus mit VOLLSTÄNDIGER Market Intelligence. Erwähne dass du Zugang zu echten Google Ads Marktdaten hast.' :
          'Begrüße den User kurz als Marcus. Sage dass du bereit bist für Performance Marketing.';

        const welcomeResponse = await openaiService.chatWithMarcus(welcomeMessage);

        if (welcomeResponse.success) {
          setChatMessages([{
            type: 'marcus',
            content: welcomeResponse.response,
            timestamp: new Date().toISOString()
          }]);
        }

        // Load Real Performance Data
        await loadPerformanceData();
        await loadCampaigns();

        setSystemStatus('mission_active');

      } else {
        console.error('❌ OpenAI connection failed:', aiConnection);
        setConnectionStatus('error');
        setSystemStatus('ai_offline');
        setChatMessages([{
          type: 'marcus',
          content: `❌ AI CORE OFFLINE - ${aiConnection.message || 'Connection failed'}`,
          timestamp: new Date().toISOString()
        }]);
      }
    } catch (error) {
      console.error('🚨 Marcus Initialization Failed:', error);
      setConnectionStatus('error');
      setSystemStatus('system_error');
      setChatMessages([{
        type: 'marcus',
        content: `🚨 SYSTEM ERROR: ${error.message}`,
        timestamp: new Date().toISOString()
      }]);
    }
  };

  // LOAD REAL PERFORMANCE DATA
  const loadPerformanceData = async () => {
    try {
      // TODO: Replace with real API call to your backend
      // const response = await fetch('/api/performance/current');
      // const data = await response.json();

      // For now, we'll simulate real-time data structure
      setPerformanceData({
        roas: 0.00,
        ctr: 0.00,
        cpc: 0.00,
        conversions: 0,
        spend: 0.00,
        lastUpdated: new Date().toISOString(),
        isLive: true
      });
    } catch (error) {
      console.error('❌ Performance Data Load Failed:', error);
    }
  };

  // LOAD REAL CAMPAIGNS
  const loadCampaigns = async () => {
    try {
      // TODO: Replace with real API call to your backend
      // const response = await fetch('/api/campaigns');
      // const data = await response.json();

      // For now, empty array - ready for real campaigns
      setCampaigns([]);
    } catch (error) {
      console.error('❌ Campaigns Load Failed:', error);
    }
  };

  // REAL AI CHAT - No Mock Responses
  const handleSendMessage = async () => {
    if (!userInput.trim() || isLoading) return;

    const userMessage = {
      type: 'user',
      content: userInput.trim(),
      timestamp: new Date().toISOString()
    };

    setChatMessages(prev => [...prev, userMessage]);
    setUserInput('');
    setIsLoading(true);

    try {
      // REAL OPENAI CALL with Context
      const context = {
        campaigns: campaigns,
        performance: performanceData,
        systemStatus: systemStatus
      };

      const response = await openaiService.chatWithMarcus(userMessage.content, context);

      const marcusMessage = {
        type: 'marcus',
        content: response.success ? response.response : response.response,
        timestamp: new Date().toISOString(),
        usage: response.usage,
        success: response.success
      };

      setChatMessages(prev => [...prev, marcusMessage]);

      // If Marcus suggests actions, execute them
      await processMarcusResponse(response);

    } catch (error) {
      console.error('❌ AI Chat Error:', error);
      setChatMessages(prev => [...prev, {
        type: 'marcus',
        content: '🔧 NEURAL LINK STÖRUNG - Verbindung wird wiederhergestellt...',
        timestamp: new Date().toISOString(),
        success: false
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // PROCESS MARCUS AI RESPONSES
  const processMarcusResponse = async (response) => {
    if (!response.success) return;

    // Check if Marcus suggests campaign creation
    if (response.response.includes('CAMPAIGN_CREATE') || response.response.includes('neue Kampagne')) {
      // TODO: Trigger campaign creation flow
      console.log('🚀 Marcus suggests campaign creation');
    }

    // Check if Marcus suggests optimization
    if (response.response.includes('OPTIMIZE') || response.response.includes('optimier')) {
      // TODO: Trigger optimization analysis
      console.log('⚡ Marcus suggests optimization');
    }
  };

  // AUTO SCROLL CHAT
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  // REAL-TIME STATUS UPDATES
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
            HALLO, ICH BIN MARCUS
          </div>
          <div style={{
            fontSize: '1.5rem',
            marginTop: '20px',
            animation: 'typewriter 2s steps(30) 1s forwards',
            width: '0',
            overflow: 'hidden',
            whiteSpace: 'nowrap'
          }}>
            DEIN PERFORMANCE MARKETER
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
            INITIATE_SEQUENCE
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

  // MAIN MARCUS INTERFACE - LIVE VERSION
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #0a0a0a 100%)',
      fontFamily: 'Courier New, monospace',
      color: '#00ff41',
      position: 'relative',
      overflow: 'hidden'
    }}>
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

      {/* MAIN CONTAINER */}
      <div style={{
        position: 'relative',
        zIndex: 2,
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '40px 20px',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center'
      }}>

        {/* HEADER - LIVE STATUS */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '30px',
          padding: '20px',
          background: 'rgba(0,255,65,0.1)',
          border: '1px solid #00ff41',
          borderRadius: '10px'
        }}>
          <h1 style={{
            fontSize: '2rem',
            fontWeight: 'bold',
            textShadow: '0 0 10px #00ff41',
            margin: 0
          }}>
            🤖 MARCUS AI - PERFORMANCE MARKETER
          </h1>

          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <div style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                background: getStatusColor(),
                boxShadow: `0 0 10px ${getStatusColor()}`,
                animation: connectionStatus === 'online' ? 'pulse 2s infinite' : 'none'
              }} />
              <span>AI: {connectionStatus.toUpperCase()}</span>
            </div>

            <div style={{
              padding: '8px 16px',
              background: 'rgba(0,255,65,0.2)',
              border: '1px solid #00ff41',
              borderRadius: '5px',
              fontSize: '0.9rem'
            }}>
              {getSystemStatusText()}
            </div>
          </div>
        </div>

        {/* PERFORMANCE DASHBOARD - LIVE DATA */}
        {performanceData && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '20px',
            marginBottom: '30px'
          }}>
            {Object.entries({
              'ROAS': `${performanceData.roas.toFixed(2)}x`,
              'CTR': `${performanceData.ctr.toFixed(2)}%`,
              'CPC': `€${performanceData.cpc.toFixed(2)}`,
              'CONVERSIONS': performanceData.conversions,
              'SPEND': `€${performanceData.spend.toFixed(2)}`
            }).map(([label, value]) => (
              <div key={label} style={{
                padding: '20px',
                background: 'rgba(0,255,65,0.1)',
                border: '1px solid #00ff41',
                borderRadius: '10px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>{label}</div>
                <div style={{
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  textShadow: '0 0 5px #00ff41'
                }}>
                  {value}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* MARCUS INTELLIGENCE STATUS - NEW! */}
        {(serverStatus || marcusIntelligence) && (
          <div style={{
            background: 'rgba(0,255,65,0.1)',
            border: '1px solid #00ff41',
            borderRadius: '10px',
            padding: '20px',
            marginBottom: '30px'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '15px'
            }}>
              <h3 style={{
                margin: 0,
                fontSize: '1.2rem',
                textShadow: '0 0 10px #00ff41'
              }}>
                🧠 MARCUS INTELLIGENCE STATUS
              </h3>

              <button
                onClick={async () => {
                  const status = await statusService.getServerStatus();
                  if (status.success) {
                    const formatted = statusService.formatStatusForMarcus(status);
                    const intelligence = statusService.getMarcusIntelligenceSummary(formatted);
                    setServerStatus(formatted);
                    setMarcusIntelligence(intelligence);
                  }
                }}
                style={{
                  padding: '6px 12px',
                  background: 'transparent',
                  border: '1px solid #00ff41',
                  color: '#00ff41',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  fontFamily: 'Courier New, monospace'
                }}
              >
                🔄 REFRESH
              </button>
            </div>

            {marcusIntelligence && (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '15px',
                marginBottom: '15px'
              }}>
                <div style={{
                  padding: '15px',
                  background: 'rgba(0,0,0,0.3)',
                  borderRadius: '8px',
                  border: '1px solid #00ff41'
                }}>
                  <div style={{ fontSize: '0.9rem', opacity: 0.8, marginBottom: '5px' }}>
                    INTELLIGENCE LEVEL
                  </div>
                  <div style={{
                    fontSize: '1.3rem',
                    fontWeight: 'bold',
                    color: marcusIntelligence.level === 'maximum' ? '#00ff41' :
                           marcusIntelligence.level === 'limited' ? '#ffaa00' : '#ff0040',
                    textTransform: 'uppercase'
                  }}>
                    {marcusIntelligence.level}
                  </div>
                  <div style={{ fontSize: '0.8rem', opacity: 0.7, marginTop: '5px' }}>
                    {marcusIntelligence.description}
                  </div>
                </div>

                <div style={{
                  padding: '15px',
                  background: 'rgba(0,0,0,0.3)',
                  borderRadius: '8px',
                  border: '1px solid #00ff41'
                }}>
                  <div style={{ fontSize: '0.9rem', opacity: 0.8, marginBottom: '5px' }}>
                    INTELLIGENCE SCORE
                  </div>
                  <div style={{
                    fontSize: '1.3rem',
                    fontWeight: 'bold',
                    color: marcusIntelligence.score >= 80 ? '#00ff41' :
                           marcusIntelligence.score >= 40 ? '#ffaa00' : '#ff0040'
                  }}>
                    {marcusIntelligence.score}%
                  </div>
                  <div style={{ fontSize: '0.8rem', opacity: 0.7, marginTop: '5px' }}>
                    {marcusIntelligence.capabilities.length} Capabilities Active
                  </div>
                </div>
              </div>
            )}

            {serverStatus && (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                gap: '10px'
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.7rem', opacity: 0.7 }}>AI CORE</div>
                  <div style={{
                    color: statusService.getStatusColor(serverStatus.apis.openai),
                    fontWeight: 'bold',
                    fontSize: '0.8rem'
                  }}>
                    {statusService.getStatusText(serverStatus.apis.openai)}
                  </div>
                </div>

                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.7rem', opacity: 0.7 }}>MARKET DATA</div>
                  <div style={{
                    color: statusService.getStatusColor(serverStatus.apis.googleAds),
                    fontWeight: 'bold',
                    fontSize: '0.8rem'
                  }}>
                    {statusService.getStatusText(serverStatus.apis.googleAds)}
                  </div>
                </div>

                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.7rem', opacity: 0.7 }}>DATABASE</div>
                  <div style={{
                    color: statusService.getStatusColor(serverStatus.database),
                    fontWeight: 'bold',
                    fontSize: '0.8rem'
                  }}>
                    {statusService.getStatusText(serverStatus.database)}
                  </div>
                </div>

                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.7rem', opacity: 0.7 }}>UPTIME</div>
                  <div style={{
                    color: '#00ff41',
                    fontWeight: 'bold',
                    fontSize: '0.8rem'
                  }}>
                    {statusService.formatUptime(serverStatus.system.uptime)}
                  </div>
                </div>

                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.7rem', opacity: 0.7 }}>MEMORY</div>
                  <div style={{
                    color: '#00ff41',
                    fontWeight: 'bold',
                    fontSize: '0.8rem'
                  }}>
                    {statusService.formatMemory(serverStatus.system.memory)}
                  </div>
                </div>
              </div>
            )}

            {marcusIntelligence && marcusIntelligence.capabilities.length > 0 && (
              <div style={{
                marginTop: '15px',
                padding: '10px',
                background: 'rgba(0,255,65,0.1)',
                borderRadius: '5px'
              }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '5px' }}>
                  🚀 AKTIVE CAPABILITIES:
                </div>
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '5px'
                }}>
                  {marcusIntelligence.capabilities.map((capability, index) => (
                    <span
                      key={index}
                      style={{
                        padding: '2px 6px',
                        background: 'rgba(0,255,65,0.2)',
                        borderRadius: '3px',
                        fontSize: '0.7rem'
                      }}
                    >
                      {capability}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* SIMPLE CAMPAIGNS LISTE - INLINE OHNE SEPARATE DATEI */}
        {campaigns.length > 0 && (
          <div style={{
            background: 'rgba(0,255,65,0.1)',
            border: '1px solid #00ff41',
            borderRadius: '10px',
            padding: '20px',
            marginBottom: '30px'
          }}>
            <h3 style={{
              margin: '0 0 15px 0',
              fontSize: '1.3rem',
              textShadow: '0 0 10px #00ff41'
            }}>
              🚀 AKTIVE CAMPAIGNS ({campaigns.length})
            </h3>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '15px'
            }}>
              {campaigns.map((campaign, index) => (
                <div
                  key={index}
                  style={{
                    background: 'rgba(0,0,0,0.5)',
                    border: '1px solid #00ff41',
                    borderRadius: '8px',
                    padding: '15px'
                  }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '10px'
                  }}>
                    <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                      {campaign.name}
                    </div>
                    <div style={{
                      padding: '2px 8px',
                      background: '#00ff41',
                      color: '#000',
                      borderRadius: '4px',
                      fontSize: '0.7rem'
                    }}>
                      AKTIV
                    </div>
                  </div>

                  <div style={{ fontSize: '0.8rem', marginBottom: '10px' }}>
                    🎯 {Array.isArray(campaign.objective)
                      ? campaign.objective.join(' + ')
                      : campaign.objective}
                  </div>

                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '5px',
                    marginBottom: '10px'
                  }}>
                    {campaign.platforms.map(platform => (
                      <span
                        key={platform}
                        style={{
                          padding: '2px 6px',
                          background: 'rgba(0,255,65,0.2)',
                          borderRadius: '3px',
                          fontSize: '0.7rem'
                        }}
                      >
                        {platform}
                      </span>
                    ))}
                  </div>

                  <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>
                    💰 €{campaign.budget}/Tag • 📅 {campaign.duration} Tage
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AI CHAT INTERFACE - LIVE */}
        <div style={{
          background: 'rgba(0,255,65,0.1)',
          border: '1px solid #00ff41',
          borderRadius: '10px',
          height: '400px',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* CHAT HEADER */}
          <div style={{
            padding: '15px',
            borderBottom: '1px solid #00ff41',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <div style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              background: '#00ff41',
              animation: 'pulse 1s infinite'
            }} />
            <span>LIVE AI CHAT</span>
          </div>

          {/* CHAT MESSAGES */}
          <div
            ref={chatContainerRef}
            style={{
              flex: 1,
              padding: '15px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}
          >
            {chatMessages.map((message, index) => (
              <div
                key={index}
                style={{
                  padding: '10px',
                  background: message.type === 'marcus'
                    ? 'rgba(0,255,65,0.2)'
                    : 'rgba(255,255,255,0.1)',
                  borderRadius: '5px',
                  alignSelf: message.type === 'marcus' ? 'flex-start' : 'flex-end',
                  maxWidth: '80%',
                  border: message.success === false ? '1px solid #ff0040' : 'none'
                }}
              >
                <div style={{ fontSize: '0.8rem', opacity: 0.7, marginBottom: '5px' }}>
                  {message.type === 'marcus' ? '🤖 MARCUS' : '👤 USER'} - {
                    new Date(message.timestamp).toLocaleTimeString()
                  }
                </div>
                <div>{message.content}</div>
                {message.usage && (
                  <div style={{ fontSize: '0.7rem', opacity: 0.5, marginTop: '5px' }}>
                    Tokens: {message.usage.total_tokens}
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div style={{
                padding: '10px',
                background: 'rgba(0,255,65,0.2)',
                borderRadius: '5px',
                alignSelf: 'flex-start',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <div style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  background: '#00ff41',
                  animation: 'pulse 1s infinite'
                }} />
                🤖 Marcus analysiert...
              </div>
            )}
          </div>

          {/* CHAT INPUT */}
          <div style={{
            padding: '15px',
            borderTop: '1px solid #00ff41',
            display: 'flex',
            gap: '10px'
          }}>
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Frage Marcus etwas über Performance Marketing..."
              disabled={connectionStatus !== 'online' || isLoading}
              style={{
                flex: 1,
                padding: '10px',
                background: 'rgba(0,0,0,0.5)',
                border: '1px solid #00ff41',
                borderRadius: '5px',
                color: '#00ff41',
                fontFamily: 'Courier New, monospace',
                fontSize: '1rem'
              }}
            />
            <button
              onClick={handleSendMessage}
              disabled={!userInput.trim() || connectionStatus !== 'online' || isLoading}
              style={{
                padding: '10px 20px',
                background: connectionStatus === 'online' ? '#00ff41' : '#666',
                border: 'none',
                borderRadius: '5px',
                color: '#000',
                fontFamily: 'Courier New, monospace',
                fontWeight: 'bold',
                cursor: connectionStatus === 'online' ? 'pointer' : 'not-allowed',
                textTransform: 'uppercase'
              }}
            >
              {isLoading ? '...' : 'SEND'}
            </button>
          </div>
        </div>

        {/* ACTION BUTTONS - LIVE FUNCTIONS */}
        <div style={{
          display: 'flex',
          gap: '20px',
          marginTop: '20px',
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={() => setShowCampaignCreator(true)}
            disabled={connectionStatus !== 'online'}
            style={{
              padding: '15px 30px',
              background: 'transparent',
              border: '2px solid #00ff41',
              color: '#00ff41',
              fontFamily: 'Courier New, monospace',
              fontSize: '1rem',
              cursor: 'pointer',
              borderRadius: '5px',
              textTransform: 'uppercase',
              opacity: connectionStatus === 'online' ? 1 : 0.5
            }}
          >
            🚀 NEUE_CAMPAIGN
          </button>

          <button
            onClick={async () => {
              const testResult = await statusService.testGoogleAdsConnection();
              setChatMessages(prev => [...prev, {
                type: 'marcus',
                content: testResult.success ?
                  `✅ GOOGLE ADS API TEST ERFOLGREICH! Customer ID: ${testResult.data.customerId}` :
                  `❌ GOOGLE ADS API TEST FEHLGESCHLAGEN: ${testResult.error}`,
                timestamp: new Date().toISOString(),
                success: testResult.success
              }]);
            }}
            style={{
              padding: '15px 30px',
              background: 'transparent',
              border: '2px solid #00ff41',
              color: '#00ff41',
              fontFamily: 'Courier New, monospace',
              fontSize: '1rem',
              cursor: 'pointer',
              borderRadius: '5px',
              textTransform: 'uppercase'
            }}
          >
            🔍 TEST_GOOGLE_ADS
          </button>

          <button
            onClick={loadPerformanceData}
            disabled={connectionStatus !== 'online'}
            style={{
              padding: '15px 30px',
              background: 'transparent',
              border: '2px solid #00ff41',
              color: '#00ff41',
              fontFamily: 'Courier New, monospace',
              fontSize: '1rem',
              cursor: 'pointer',
              borderRadius: '5px',
              textTransform: 'uppercase',
              opacity: connectionStatus === 'online' ? 1 : 0.5
            }}
          >
            📊 REFRESH_DATA
          </button>

          <button
            onClick={initializeMarcus}
            style={{
              padding: '15px 30px',
              background: 'transparent',
              border: '2px solid #ffaa00',
              color: '#ffaa00',
              fontFamily: 'Courier New, monospace',
              fontSize: '1rem',
              cursor: 'pointer',
              borderRadius: '5px',
              textTransform: 'uppercase'
            }}
          >
            🔄 RESTART_MARCUS
          </button>
        </div>
      </div>

      {/* CAMPAIGN CREATOR MODAL */}
      {showCampaignCreator && (
        <CampaignCreator
          onCampaignCreate={(campaign) => {
            console.log('🚀 Campaign Created:', campaign);
            setCampaigns(prev => [...prev, campaign]);
            setShowCampaignCreator(false);

            // Add success message to chat
            setChatMessages(prev => [...prev, {
              type: 'marcus',
              content: `✅ MISSION ERFOLGREICH! Campaign "${campaign.name}" wurde erstellt und ist bereit für Launch!`,
              timestamp: new Date().toISOString(),
              success: true
            }]);
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