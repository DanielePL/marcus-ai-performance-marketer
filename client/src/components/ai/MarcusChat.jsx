// client/src/components/ai/MarcusChat.jsx
// Enhanced Marcus AI Chat Interface mit Market Intelligence & Quick Actions
import React, { useState, useEffect, useRef } from 'react';
import { Send, Brain, TrendingUp, Search, Zap, Target, DollarSign, Users, Mic, MicOff, Copy, ThumbsUp, ThumbsDown } from 'lucide-react';
import openaiService from '../../services/openai.js';
import googleAdsClientService from '../../services/googleAds.js';

const MarcusChat = ({
  campaigns = [],
  performanceData = null,
  isVisible = true,
  onCampaignAction = null,
  marketIntelligence = null
}) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVoiceInput, setIsVoiceInput] = useState(false);
  const [selectedQuickAction, setSelectedQuickAction] = useState(null);
  const [marketContext, setMarketContext] = useState(null);
  const [conversationMode, setConversationMode] = useState('assistant'); // 'assistant', 'analyst', 'strategist'
  const [showSuggestions, setShowSuggestions] = useState(true);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Quick Action Templates
  const quickActions = [
    {
      id: 'campaign_analysis',
      title: 'Campaign Analysis',
      icon: TrendingUp,
      color: '#00ff41',
      prompt: 'Analysiere meine aktuelle Campaign Performance und gib konkrete Optimierungsvorschläge.',
      category: 'analysis'
    },
    {
      id: 'keyword_research',
      title: 'Keyword Research',
      icon: Search,
      color: '#0099ff',
      prompt: 'Führe eine Keyword-Recherche für [PRODUKT] durch und zeige mir CPC und Suchvolumen.',
      category: 'research',
      needsInput: true,
      placeholder: 'Produkt/Service eingeben...'
    },
    {
      id: 'budget_optimization',
      title: 'Budget Optimization',
      icon: DollarSign,
      color: '#ffaa00',
      prompt: 'Wie sollte ich mein Budget optimal auf meine Campaigns verteilen für maximalen ROAS?',
      category: 'optimization'
    },
    {
      id: 'audience_expansion',
      title: 'Audience Expansion',
      icon: Users,
      color: '#ff6b35',
      prompt: 'Schlage neue Zielgruppen vor basierend auf meiner aktuellen Performance.',
      category: 'targeting'
    },
    {
      id: 'competitor_analysis',
      title: 'Competitor Analysis',
      icon: Target,
      color: '#9333ea',
      prompt: 'Analysiere die Konkurrenz für [DOMAIN] und zeige mir deren Ad-Strategien.',
      category: 'intelligence',
      needsInput: true,
      placeholder: 'Competitor Domain eingeben...'
    },
    {
      id: 'auto_optimize',
      title: 'Auto-Optimize All',
      icon: Zap,
      color: '#ff0040',
      prompt: 'Optimiere automatisch alle meine aktiven Campaigns für bessere Performance.',
      category: 'automation'
    }
  ];

  // Conversation Modes
  const conversationModes = {
    'assistant': {
      name: 'Assistant',
      icon: '🤖',
      description: 'General performance marketing help',
      personality: 'Helpful and informative'
    },
    'analyst': {
      name: 'Analyst',
      icon: '📊',
      description: 'Deep data analysis and insights',
      personality: 'Analytical and detail-oriented'
    },
    'strategist': {
      name: 'Strategist',
      icon: '🎯',
      description: 'Strategic planning and optimization',
      personality: 'Strategic and forward-thinking'
    }
  };

  // Initialize chat
  useEffect(() => {
    if (isVisible && messages.length === 0) {
      initializeChat();
    }
  }, [isVisible]);

  // Auto-scroll to bottom
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize chat with welcome message
  const initializeChat = async () => {
    const welcomeMessage = {
      id: Date.now(),
      type: 'marcus',
      content: `🤖 **MARCUS AI ONLINE** - Dein Performance Marketing Intelligence ist bereit!

**Verfügbare Capabilities:**
${marketIntelligence ? '🟢 Market Intelligence: ACTIVE' : '🔴 Market Intelligence: OFFLINE'}
${campaigns.length > 0 ? `🟢 Campaign Data: ${campaigns.length} campaigns` : '🔴 Campaign Data: No campaigns'}
${performanceData ? '🟢 Performance Tracking: LIVE' : '🔴 Performance Tracking: OFFLINE'}

**Was kann ich für dich tun?**
- Campaign Performance analysieren
- Keyword Research mit echten Google Ads Daten
- Budget-Optimierung vorschlagen
- Competitor Intelligence sammeln
- Automatische Optimierungen durchführen

Nutze die Quick Actions unten oder frag mich direkt! 🚀`,
      timestamp: new Date().toISOString(),
      hasMarketData: !!marketIntelligence,
      suggestions: [
        'Zeige mir meine Campaign Performance',
        'Führe eine Keyword-Recherche durch',
        'Wie kann ich mein ROAS verbessern?',
        'Analysiere meine Konkurrenz'
      ]
    };

    setMessages([welcomeMessage]);
  };

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Handle quick action
  const handleQuickAction = async (action) => {
    setSelectedQuickAction(action);

    if (action.needsInput) {
      // Show input field for actions that need additional input
      setShowSuggestions(false);
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.placeholder = action.placeholder;
      }
      return;
    }

    // Execute action directly
    await sendMessage(action.prompt, action);
  };

  // Handle message submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!inputMessage.trim() || isLoading) return;

    let finalMessage = inputMessage;
    let actionContext = null;

    // Handle quick action with input
    if (selectedQuickAction && selectedQuickAction.needsInput) {
      finalMessage = selectedQuickAction.prompt.replace('[PRODUKT]', inputMessage).replace('[DOMAIN]', inputMessage);
      actionContext = selectedQuickAction;
      setSelectedQuickAction(null);
      if (inputRef.current) {
        inputRef.current.placeholder = 'Frage Marcus etwas über Performance Marketing...';
      }
    }

    await sendMessage(finalMessage, actionContext);
    setInputMessage('');
    setShowSuggestions(false);
  };

  // Send message to Marcus
  const sendMessage = async (message, actionContext = null) => {
    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: message,
      timestamp: new Date().toISOString(),
      action: actionContext
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Build context for Marcus
      const context = {
        campaigns,
        performance: performanceData,
        marketIntelligence,
        conversationMode,
        action: actionContext?.category
      };

      // Get market intelligence if action is research-related
      if (actionContext?.category === 'research' || actionContext?.category === 'intelligence') {
        try {
          const keywords = extractKeywordsFromMessage(message);
          if (keywords.length > 0) {
            console.log('🔍 Getting market intelligence for:', keywords);
            const marketData = await googleAdsClientService.getMarketIntelligence(keywords);
            if (marketData.success) {
              setMarketContext(marketData.data);
              context.liveMarketData = marketData.data;
            }
          }
        } catch (error) {
          console.error('❌ Market intelligence failed:', error);
        }
      }

      // Get response from Marcus
      const response = await openaiService.chatWithMarcus(message, context);

      const marcusMessage = {
        id: Date.now() + 1,
        type: 'marcus',
        content: response.success ? response.response : `❌ ${response.error}`,
        timestamp: new Date().toISOString(),
        success: response.success,
        usage: response.usage,
        marketData: response.marketIntelligence,
        actionType: actionContext?.category,
        suggestions: generateFollowUpSuggestions(message, actionContext)
      };

      setMessages(prev => [...prev, marcusMessage]);

      // Auto-execute campaign actions if suggested
      if (response.success && actionContext?.category === 'automation') {
        setTimeout(() => {
          handleAutomationResponse(response.response);
        }, 2000);
      }

    } catch (error) {
      console.error('❌ Marcus Chat Error:', error);

      const errorMessage = {
        id: Date.now() + 1,
        type: 'marcus',
        content: `🔧 **NEURAL LINK STÖRUNG** - ${error.message}
        
Backup-Systeme aktiv... Versuche es erneut!`,
        timestamp: new Date().toISOString(),
        success: false
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Extract keywords from message
  const extractKeywordsFromMessage = (message) => {
    // Simple keyword extraction - could be enhanced with NLP
    const words = message.toLowerCase()
      .replace(/[^a-zA-Z\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3)
      .filter(word => !['campaign', 'marketing', 'performance', 'google', 'meta', 'analyze', 'research'].includes(word));

    return [...new Set(words)].slice(0, 3);
  };

  // Generate follow-up suggestions
  const generateFollowUpSuggestions = (message, actionContext) => {
    const suggestions = [];

    if (actionContext?.category === 'analysis') {
      suggestions.push('Optimiere diese Campaigns automatisch');
      suggestions.push('Zeige mir Budget-Empfehlungen');
      suggestions.push('Welche Keywords sollte ich hinzufügen?');
    } else if (actionContext?.category === 'research') {
      suggestions.push('Erstelle eine Campaign für diese Keywords');
      suggestions.push('Analysiere die Konkurrenz für diese Keywords');
      suggestions.push('Welches Budget empfiehlst du?');
    } else {
      suggestions.push('Zeige mir aktuelle Performance');
      suggestions.push('Führe eine Keyword-Recherche durch');
      suggestions.push('Optimiere meine Campaigns');
    }

    return suggestions.slice(0, 3);
  };

  // Handle automation responses
  const handleAutomationResponse = (response) => {
    // Parse Marcus response for automation commands
    if (response.includes('OPTIMIZE') || response.includes('optimier')) {
      console.log('🤖 Marcus suggests optimization - executing...');
      if (onCampaignAction) {
        onCampaignAction('optimize_all');
      }
    }
  };

  // Copy message to clipboard
  const copyMessage = (content) => {
    navigator.clipboard.writeText(content);
    console.log('📋 Message copied to clipboard');
  };

  // Voice input (placeholder)
  const toggleVoiceInput = () => {
    setIsVoiceInput(!isVoiceInput);
    // TODO: Implement speech recognition
    console.log('🎤 Voice input:', !isVoiceInput ? 'ON' : 'OFF');
  };

  if (!isVisible) return null;

  return (
    <div style={{
      background: 'rgba(0,255,65,0.1)',
      border: '1px solid #00ff41',
      borderRadius: '15px',
      height: '600px',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'Courier New, monospace',
      color: '#00ff41',
      overflow: 'hidden'
    }}>

      {/* CHAT HEADER */}
      <div style={{
        padding: '20px',
        borderBottom: '1px solid #00ff41',
        background: 'rgba(0,255,65,0.1)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <Brain size={24} style={{ color: '#00ff41' }} />
          <div>
            <h3 style={{
              margin: 0,
              fontSize: '1.2rem',
              textShadow: '0 0 10px #00ff41'
            }}>
              🤖 MARCUS AI CHAT
            </h3>
            <div style={{
              fontSize: '0.8rem',
              opacity: 0.8
            }}>
              {conversationModes[conversationMode].personality} •
              {marketIntelligence ? ' Market Intelligence Active' : ' Basic Mode'}
            </div>
          </div>
        </div>

        {/* Conversation Mode Selector */}
        <div style={{
          display: 'flex',
          gap: '5px'
        }}>
          {Object.entries(conversationModes).map(([mode, config]) => (
            <button
              key={mode}
              onClick={() => setConversationMode(mode)}
              style={{
                padding: '6px 12px',
                background: conversationMode === mode ? '#00ff41' : 'transparent',
                color: conversationMode === mode ? '#000' : '#00ff41',
                border: '1px solid #00ff41',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '0.7rem',
                fontFamily: 'Courier New, monospace'
              }}
              title={config.description}
            >
              {config.icon} {config.name}
            </button>
          ))}
        </div>
      </div>

      {/* QUICK ACTIONS */}
      {showSuggestions && (
        <div style={{
          padding: '15px',
          borderBottom: '1px solid #333',
          background: 'rgba(0,0,0,0.3)'
        }}>
          <div style={{
            fontSize: '0.9rem',
            marginBottom: '10px',
            fontWeight: 'bold'
          }}>
            ⚡ QUICK ACTIONS
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '8px'
          }}>
            {quickActions.map(action => {
              const Icon = action.icon;
              return (
                <button
                  key={action.id}
                  onClick={() => handleQuickAction(action)}
                  style={{
                    padding: '8px 12px',
                    background: 'transparent',
                    border: `1px solid ${action.color}`,
                    color: action.color,
                    borderRadius: '5px',
                    cursor: 'pointer',
                    fontSize: '0.7rem',
                    fontFamily: 'Courier New, monospace',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    textAlign: 'left'
                  }}
                >
                  <Icon size={14} />
                  {action.title}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* MESSAGES */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '15px',
        display: 'flex',
        flexDirection: 'column',
        gap: '15px'
      }}>
        {messages.map(message => (
          <div
            key={message.id}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignSelf: message.type === 'marcus' ? 'flex-start' : 'flex-end',
              maxWidth: '85%'
            }}
          >
            <div style={{
              padding: '12px 16px',
              background: message.type === 'marcus'
                ? 'rgba(0,255,65,0.2)'
                : 'rgba(255,255,255,0.1)',
              borderRadius: message.type === 'marcus' ? '15px 15px 15px 5px' : '15px 15px 5px 15px',
              border: message.success === false ? '1px solid #ff0040' : '1px solid transparent',
              position: 'relative'
            }}>
              {/* Message Header */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '8px',
                fontSize: '0.7rem',
                opacity: 0.8
              }}>
                <span>
                  {message.type === 'marcus' ? '🤖 MARCUS' : '👤 USER'} •
                  {new Date(message.timestamp).toLocaleTimeString()}
                </span>

                {message.type === 'marcus' && (
                  <div style={{ display: 'flex', gap: '5px' }}>
                    <button
                      onClick={() => copyMessage(message.content)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#00ff41',
                        cursor: 'pointer',
                        padding: '2px'
                      }}
                    >
                      <Copy size={12} />
                    </button>
                  </div>
                )}
              </div>

              {/* Message Content */}
              <div style={{
                lineHeight: '1.4',
                fontSize: '0.9rem',
                whiteSpace: 'pre-line'
              }}>
                {message.content}
              </div>

              {/* Market Data Indicator */}
              {message.marketData && (
                <div style={{
                  marginTop: '8px',
                  padding: '6px 10px',
                  background: 'rgba(0,153,255,0.2)',
                  borderRadius: '5px',
                  fontSize: '0.7rem',
                  border: '1px solid #0099ff'
                }}>
                  📈 Response includes live market intelligence
                </div>
              )}

              {/* Usage Info */}
              {message.usage && (
                <div style={{
                  marginTop: '6px',
                  fontSize: '0.6rem',
                  opacity: 0.5
                }}>
                  Tokens: {message.usage.total_tokens}
                </div>
              )}
            </div>

            {/* Follow-up Suggestions */}
            {message.suggestions && message.suggestions.length > 0 && (
              <div style={{
                marginTop: '8px',
                display: 'flex',
                flexWrap: 'wrap',
                gap: '5px'
              }}>
                {message.suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => sendMessage(suggestion)}
                    style={{
                      padding: '4px 8px',
                      background: 'transparent',
                      border: '1px solid #00ff41',
                      color: '#00ff41',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      fontSize: '0.6rem',
                      fontFamily: 'Courier New, monospace'
                    }}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}

        {/* Loading indicator */}
        {isLoading && (
          <div style={{
            alignSelf: 'flex-start',
            padding: '12px 16px',
            background: 'rgba(0,255,65,0.2)',
            borderRadius: '15px 15px 15px 5px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <div style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              background: '#00ff41',
              animation: 'pulse 1s infinite'
            }} />
            <span>🤖 Marcus analysiert mit Market Intelligence...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* INPUT */}
      <form onSubmit={handleSubmit} style={{
        padding: '15px',
        borderTop: '1px solid #00ff41',
        background: 'rgba(0,255,65,0.1)',
        display: 'flex',
        gap: '10px',
        alignItems: 'center'
      }}>
        <input
          ref={inputRef}
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder={selectedQuickAction?.needsInput ? selectedQuickAction.placeholder : 'Frage Marcus etwas über Performance Marketing...'}
          disabled={isLoading}
          style={{
            flex: 1,
            padding: '12px',
            background: 'rgba(0,0,0,0.5)',
            border: '1px solid #00ff41',
            borderRadius: '8px',
            color: '#00ff41',
            fontFamily: 'Courier New, monospace',
            fontSize: '0.9rem'
          }}
        />

        <button
          type="button"
          onClick={toggleVoiceInput}
          style={{
            padding: '12px',
            background: isVoiceInput ? '#00ff41' : 'transparent',
            color: isVoiceInput ? '#000' : '#00ff41',
            border: '1px solid #00ff41',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          {isVoiceInput ? <MicOff size={16} /> : <Mic size={16} />}
        </button>

        <button
          type="submit"
          disabled={!inputMessage.trim() || isLoading}
          style={{
            padding: '12px 16px',
            background: inputMessage.trim() && !isLoading ? '#00ff41' : '#333',
            color: inputMessage.trim() && !isLoading ? '#000' : '#666',
            border: 'none',
            borderRadius: '8px',
            cursor: inputMessage.trim() && !isLoading ? 'pointer' : 'not-allowed',
            fontFamily: 'Courier New, monospace',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          {isLoading ? '...' : <><Send size={16} /> SEND</>}
        </button>
      </form>

      <style jsx>{`
        @keyframes pulse {
          0% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.1); }
          100% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

export default MarcusChat;