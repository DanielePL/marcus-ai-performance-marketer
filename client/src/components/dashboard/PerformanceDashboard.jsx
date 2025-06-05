// client/src/components/dashboard/PerformanceDashboard.jsx
// Marcus Live Performance Dashboard mit Real-time Charts & Analytics
import React, { useState, useEffect, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, Target, DollarSign, Users, MousePointer, ShoppingCart, AlertTriangle, CheckCircle } from 'lucide-react';

const PerformanceDashboard = ({ isVisible = true, campaigns = [], realTimeData = null }) => {
  const [timeframe, setTimeframe] = useState('24h');
  const [selectedMetric, setSelectedMetric] = useState('overview');
  const [liveMetrics, setLiveMetrics] = useState({});
  const [chartData, setChartData] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const updateIntervalRef = useRef(null);

  // Color schemes for charts
  const colors = {
    primary: '#00ff41',
    secondary: '#0099ff',
    accent: '#ff6b35',
    warning: '#ffaa00',
    danger: '#ff0040',
    success: '#00ff41'
  };

  // Chart color palette
  const chartColors = ['#00ff41', '#0099ff', '#ff6b35', '#ffaa00', '#ff0040', '#9333ea'];

  // Initialize dashboard data
  useEffect(() => {
    if (isVisible) {
      loadDashboardData();
      startLiveUpdates();
    } else {
      stopLiveUpdates();
    }

    return () => stopLiveUpdates();
  }, [isVisible, timeframe]);

  // Load dashboard data
  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      // TODO: Replace with real API calls
      // const performanceData = await fetch(`/api/performance/dashboard?timeframe=${timeframe}`);
      // const alertsData = await fetch('/api/performance/alerts');

      // Simulate realistic data for now
      const mockData = generateMockPerformanceData();
      setChartData(mockData.chartData);
      setLiveMetrics(mockData.liveMetrics);
      setAlerts(mockData.alerts);

    } catch (error) {
      console.error('❌ Dashboard data load failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Start live updates
  const startLiveUpdates = () => {
    updateIntervalRef.current = setInterval(() => {
      updateLiveMetrics();
    }, 30000); // Update every 30 seconds
  };

  // Stop live updates
  const stopLiveUpdates = () => {
    if (updateIntervalRef.current) {
      clearInterval(updateIntervalRef.current);
    }
  };

  // Update live metrics
  const updateLiveMetrics = () => {
    setLiveMetrics(prev => ({
      ...prev,
      roas: (prev.roas + (Math.random() - 0.5) * 0.2).toFixed(2),
      ctr: (prev.ctr + (Math.random() - 0.5) * 0.1).toFixed(2),
      cpc: (prev.cpc + (Math.random() - 0.5) * 0.05).toFixed(2),
      spend: (parseFloat(prev.spend) + Math.random() * 50).toFixed(2),
      lastUpdated: new Date().toISOString()
    }));

    // Add new data point to chart
    setChartData(prev => {
      const newDataPoint = {
        time: new Date().toLocaleTimeString(),
        roas: parseFloat(liveMetrics.roas),
        ctr: parseFloat(liveMetrics.ctr),
        cpc: parseFloat(liveMetrics.cpc),
        spend: parseFloat(liveMetrics.spend),
        conversions: Math.floor(Math.random() * 10) + 1
      };

      return [...prev.slice(-23), newDataPoint]; // Keep last 24 data points
    });
  };

  // Generate mock performance data
  const generateMockPerformanceData = () => {
    const now = new Date();
    const chartData = [];

    // Generate 24 hours of data
    for (let i = 23; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 60 * 60 * 1000);
      chartData.push({
        time: time.toLocaleTimeString(),
        roas: (Math.random() * 3 + 1.5).toFixed(2),
        ctr: (Math.random() * 4 + 1).toFixed(2),
        cpc: (Math.random() * 2 + 0.5).toFixed(2),
        spend: Math.floor(Math.random() * 500 + 100),
        conversions: Math.floor(Math.random() * 20 + 5),
        impressions: Math.floor(Math.random() * 10000 + 5000),
        clicks: Math.floor(Math.random() * 200 + 100)
      });
    }

    const liveMetrics = {
      roas: '2.34',
      ctr: '2.8',
      cpc: '1.23',
      spend: '1247.50',
      conversions: 142,
      impressions: 45230,
      clicks: 1267,
      revenue: '2918.45',
      lastUpdated: new Date().toISOString()
    };

    const alerts = [
      {
        id: 1,
        type: 'warning',
        title: 'Budget Überschreitung',
        message: 'Google Ads Campaign "Summer Sale" hat 15% über dem Tagesbudget ausgegeben',
        campaign: 'Summer Sale',
        timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
        severity: 'medium'
      },
      {
        id: 2,
        type: 'success',
        title: 'ROAS Verbesserung',
        message: 'Meta Ads Campaign "Brand Awareness" zeigt +25% ROAS Verbesserung',
        campaign: 'Brand Awareness',
        timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
        severity: 'low'
      },
      {
        id: 3,
        type: 'error',
        title: 'Niedrige CTR',
        message: 'Campaign "Product Launch" hat CTR unter 1% - Optimization erforderlich',
        campaign: 'Product Launch',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        severity: 'high'
      }
    ];

    return { chartData, liveMetrics, alerts };
  };

  // Metric cards data
  const metricCards = [
    {
      title: 'ROAS',
      value: `${liveMetrics.roas || '0.00'}x`,
      change: '+12.5%',
      trend: 'up',
      icon: TrendingUp,
      color: colors.success
    },
    {
      title: 'CTR',
      value: `${liveMetrics.ctr || '0.00'}%`,
      change: '+5.8%',
      trend: 'up',
      icon: MousePointer,
      color: colors.primary
    },
    {
      title: 'CPC',
      value: `€${liveMetrics.cpc || '0.00'}`,
      change: '-8.2%',
      trend: 'down',
      icon: DollarSign,
      color: colors.success
    },
    {
      title: 'SPEND',
      value: `€${liveMetrics.spend || '0.00'}`,
      change: '+18.7%',
      trend: 'up',
      icon: Target,
      color: colors.warning
    },
    {
      title: 'CONVERSIONS',
      value: liveMetrics.conversions || 0,
      change: '+23.1%',
      trend: 'up',
      icon: ShoppingCart,
      color: colors.success
    },
    {
      title: 'REVENUE',
      value: `€${liveMetrics.revenue || '0.00'}`,
      change: '+15.4%',
      trend: 'up',
      icon: TrendingUp,
      color: colors.success
    }
  ];

  // Platform performance data for pie chart
  const platformData = [
    { name: 'Google Ads', value: 45, spend: 567.89, color: '#4285f4' },
    { name: 'Meta Ads', value: 35, spend: 445.23, color: '#1877f2' },
    { name: 'TikTok', value: 15, spend: 189.45, color: '#ff0050' },
    { name: 'LinkedIn', value: 5, spend: 78.93, color: '#0077b5' }
  ];

  if (!isVisible) return null;

  return (
    <div style={{
      background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #0a0a0a 100%)',
      fontFamily: 'Courier New, monospace',
      color: '#00ff41',
      padding: '20px',
      borderRadius: '15px',
      border: '1px solid #00ff41'
    }}>

      {/* DASHBOARD HEADER */}
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
            textShadow: '0 0 10px #00ff41',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            📊 MARCUS PERFORMANCE DASHBOARD
            {isLoading && (
              <div style={{
                width: '15px',
                height: '15px',
                borderRadius: '50%',
                background: '#00ff41',
                animation: 'pulse 1s infinite'
              }} />
            )}
          </h2>
          <div style={{
            fontSize: '0.9rem',
            opacity: 0.7,
            marginTop: '5px'
          }}>
            Live Analytics • Updated: {liveMetrics.lastUpdated ?
              new Date(liveMetrics.lastUpdated).toLocaleTimeString() : 'Never'}
          </div>
        </div>

        {/* TIMEFRAME SELECTOR */}
        <div style={{
          display: 'flex',
          gap: '10px'
        }}>
          {['1h', '24h', '7d', '30d'].map(tf => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              style={{
                padding: '8px 16px',
                background: timeframe === tf ? '#00ff41' : 'transparent',
                color: timeframe === tf ? '#000' : '#00ff41',
                border: '1px solid #00ff41',
                borderRadius: '5px',
                cursor: 'pointer',
                fontFamily: 'Courier New, monospace',
                fontSize: '0.8rem'
              }}
            >
              {tf.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* LIVE METRICS CARDS */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px',
        marginBottom: '30px'
      }}>
        {metricCards.map((metric, index) => (
          <div
            key={index}
            style={{
              background: 'rgba(0,255,65,0.1)',
              border: '1px solid #00ff41',
              borderRadius: '10px',
              padding: '20px',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* Animated background */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: `linear-gradient(90deg, transparent, ${metric.color}20, transparent)`,
              animation: 'shimmer 3s ease-in-out infinite'
            }} />

            <div style={{
              position: 'relative',
              zIndex: 2
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '10px'
              }}>
                <span style={{
                  fontSize: '0.9rem',
                  opacity: 0.8,
                  fontWeight: 'bold'
                }}>
                  {metric.title}
                </span>
                <metric.icon
                  size={20}
                  style={{ color: metric.color }}
                />
              </div>

              <div style={{
                fontSize: '1.8rem',
                fontWeight: 'bold',
                color: metric.color,
                marginBottom: '5px'
              }}>
                {metric.value}
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                fontSize: '0.8rem'
              }}>
                {metric.trend === 'up' ? (
                  <TrendingUp size={14} style={{ color: colors.success }} />
                ) : (
                  <TrendingDown size={14} style={{ color: colors.success }} />
                )}
                <span style={{
                  color: metric.trend === 'up' ? colors.success : colors.success
                }}>
                  {metric.change}
                </span>
                <span style={{ opacity: 0.6 }}>vs last period</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CHARTS SECTION */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '2fr 1fr',
        gap: '20px',
        marginBottom: '30px'
      }}>

        {/* MAIN PERFORMANCE CHART */}
        <div style={{
          background: 'rgba(0,255,65,0.1)',
          border: '1px solid #00ff41',
          borderRadius: '10px',
          padding: '20px'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px'
          }}>
            <h3 style={{
              margin: 0,
              fontSize: '1.2rem',
              color: '#00ff41'
            }}>
              📈 LIVE PERFORMANCE TRENDS
            </h3>

            <select
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value)}
              style={{
                padding: '5px 10px',
                background: 'rgba(0,0,0,0.5)',
                border: '1px solid #00ff41',
                color: '#00ff41',
                borderRadius: '5px',
                fontFamily: 'Courier New, monospace'
              }}
            >
              <option value="overview">Overview</option>
              <option value="roas">ROAS</option>
              <option value="ctr">CTR</option>
              <option value="cpc">CPC</option>
              <option value="spend">Spend</option>
            </select>
          </div>

          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis
                dataKey="time"
                stroke="#00ff41"
                fontSize={12}
              />
              <YAxis stroke="#00ff41" fontSize={12} />
              <Tooltip
                contentStyle={{
                  background: 'rgba(0,0,0,0.9)',
                  border: '1px solid #00ff41',
                  borderRadius: '5px',
                  color: '#00ff41'
                }}
              />
              <Legend />

              {selectedMetric === 'overview' ? (
                <>
                  <Area
                    type="monotone"
                    dataKey="roas"
                    stroke={colors.primary}
                    fill={colors.primary + '30'}
                    name="ROAS"
                  />
                  <Area
                    type="monotone"
                    dataKey="ctr"
                    stroke={colors.secondary}
                    fill={colors.secondary + '30'}
                    name="CTR %"
                  />
                </>
              ) : (
                <Area
                  type="monotone"
                  dataKey={selectedMetric}
                  stroke={colors.primary}
                  fill={colors.primary + '30'}
                  name={selectedMetric.toUpperCase()}
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* PLATFORM DISTRIBUTION */}
        <div style={{
          background: 'rgba(0,255,65,0.1)',
          border: '1px solid #00ff41',
          borderRadius: '10px',
          padding: '20px'
        }}>
          <h3 style={{
            margin: '0 0 20px 0',
            fontSize: '1.2rem',
            color: '#00ff41'
          }}>
            📱 PLATFORM SPEND
          </h3>

          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={platformData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {platformData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value, name, props) => [
                  `€${props.payload.spend}`,
                  `${value}%`
                ]}
                contentStyle={{
                  background: 'rgba(0,0,0,0.9)',
                  border: '1px solid #00ff41',
                  borderRadius: '5px',
                  color: '#00ff41'
                }}
              />
            </PieChart>
          </ResponsiveContainer>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            marginTop: '15px'
          }}>
            {platformData.map((platform, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '0.8rem'
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <div style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    background: platform.color
                  }} />
                  <span>{platform.name}</span>
                </div>
                <span>€{platform.spend}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ALERTS & NOTIFICATIONS */}
      <div style={{
        background: 'rgba(0,255,65,0.1)',
        border: '1px solid #00ff41',
        borderRadius: '10px',
        padding: '20px'
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
            color: '#00ff41'
          }}>
            🚨 LIVE ALERTS & NOTIFICATIONS
          </h3>
          <div style={{
            padding: '4px 8px',
            background: 'rgba(255,0,64,0.2)',
            border: '1px solid #ff0040',
            borderRadius: '4px',
            fontSize: '0.8rem'
          }}>
            {alerts.filter(a => a.severity === 'high').length} HIGH PRIORITY
          </div>
        </div>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          maxHeight: '200px',
          overflowY: 'auto'
        }}>
          {alerts.map((alert) => (
            <div
              key={alert.id}
              style={{
                padding: '12px',
                background: 'rgba(0,0,0,0.3)',
                border: `1px solid ${
                  alert.type === 'error' ? colors.danger :
                  alert.type === 'warning' ? colors.warning :
                  colors.success
                }`,
                borderRadius: '5px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}
            >
              {alert.type === 'error' ? (
                <AlertTriangle size={16} style={{ color: colors.danger }} />
              ) : alert.type === 'warning' ? (
                <AlertTriangle size={16} style={{ color: colors.warning }} />
              ) : (
                <CheckCircle size={16} style={{ color: colors.success }} />
              )}

              <div style={{ flex: 1 }}>
                <div style={{
                  fontWeight: 'bold',
                  fontSize: '0.9rem',
                  marginBottom: '2px'
                }}>
                  {alert.title}
                </div>
                <div style={{
                  fontSize: '0.8rem',
                  opacity: 0.8,
                  lineHeight: '1.3'
                }}>
                  {alert.message}
                </div>
                <div style={{
                  fontSize: '0.7rem',
                  opacity: 0.6,
                  marginTop: '4px'
                }}>
                  {alert.campaign} • {new Date(alert.timestamp).toLocaleTimeString()}
                </div>
              </div>

              <button
                style={{
                  padding: '4px 8px',
                  background: 'transparent',
                  border: '1px solid #00ff41',
                  color: '#00ff41',
                  borderRadius: '3px',
                  cursor: 'pointer',
                  fontSize: '0.7rem',
                  fontFamily: 'Courier New, monospace'
                }}
              >
                RESOLVE
              </button>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes pulse {
          0% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.1); }
          100% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

export default PerformanceDashboard;