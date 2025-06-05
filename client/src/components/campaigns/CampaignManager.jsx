// client/src/components/campaigns/CampaignManager.jsx
// Marcus Campaign Management Interface mit Live Performance & AI Optimization
import React, { useState, useEffect } from 'react';
import { Play, Pause, MoreVertical, TrendingUp, TrendingDown, Target, Edit, Trash2, RefreshCw, Zap, Eye, Settings } from 'lucide-react';

const CampaignManager = ({ campaigns = [], onCampaignUpdate, onCampaignDelete, onCampaignOptimize }) => {
  const [selectedCampaigns, setSelectedCampaigns] = useState([]);
  const [sortBy, setSortBy] = useState('performance');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPlatform, setFilterPlatform] = useState('all');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [showOptimizationModal, setShowOptimizationModal] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);

  // Platform icons and colors
  const platformConfig = {
    'google': { icon: '🔍', color: '#4285f4', name: 'Google Ads' },
    'meta': { icon: '📘', color: '#1877f2', name: 'Meta Ads' },
    'instagram': { icon: '📸', color: '#e4405f', name: 'Instagram' },
    'tiktok': { icon: '🎵', color: '#ff0050', name: 'TikTok' },
    'linkedin': { icon: '💼', color: '#0077b5', name: 'LinkedIn' },
    'youtube': { icon: '🎥', color: '#ff0000', name: 'YouTube' }
  };

  // Status configuration
  const statusConfig = {
    'active': { color: '#00ff41', text: 'ACTIVE', icon: Play },
    'paused': { color: '#ffaa00', text: 'PAUSED', icon: Pause },
    'draft': { color: '#666', text: 'DRAFT', icon: Edit },
    'completed': { color: '#0099ff', text: 'COMPLETED', icon: Target },
    'deleted': { color: '#ff0040', text: 'DELETED', icon: Trash2 }
  };

  // Sort campaigns
  const sortedCampaigns = [...campaigns].sort((a, b) => {
    switch (sortBy) {
      case 'performance':
        return (b.metrics?.roas || 0) - (a.metrics?.roas || 0);
      case 'spend':
        return (b.metrics?.spend || 0) - (a.metrics?.spend || 0);
      case 'name':
        return a.name.localeCompare(b.name);
      case 'created':
        return new Date(b.createdAt) - new Date(a.createdAt);
      default:
        return 0;
    }
  });

  // Filter campaigns
  const filteredCampaigns = sortedCampaigns.filter(campaign => {
    const statusMatch = filterStatus === 'all' || campaign.status === filterStatus;
    const platformMatch = filterPlatform === 'all' || campaign.platform === filterPlatform;
    return statusMatch && platformMatch;
  });

  // Handle campaign selection
  const toggleCampaignSelection = (campaignId) => {
    setSelectedCampaigns(prev =>
      prev.includes(campaignId)
        ? prev.filter(id => id !== campaignId)
        : [...prev, campaignId]
    );
  };

  // Select all campaigns
  const selectAllCampaigns = () => {
    setSelectedCampaigns(
      selectedCampaigns.length === filteredCampaigns.length
        ? []
        : filteredCampaigns.map(c => c.id)
    );
  };

  // Bulk actions
  const handleBulkAction = async (action) => {
    const selectedCampaignData = filteredCampaigns.filter(c => selectedCampaigns.includes(c.id));

    switch (action) {
      case 'pause':
        console.log('Pausing campaigns:', selectedCampaignData.map(c => c.name));
        // TODO: API call to pause campaigns
        break;
      case 'activate':
        console.log('Activating campaigns:', selectedCampaignData.map(c => c.name));
        // TODO: API call to activate campaigns
        break;
      case 'optimize':
        console.log('Optimizing campaigns:', selectedCampaignData.map(c => c.name));
        // TODO: API call to optimize campaigns
        break;
      case 'delete':
        console.log('Deleting campaigns:', selectedCampaignData.map(c => c.name));
        // TODO: API call to delete campaigns
        break;
    }

    setSelectedCampaigns([]);
  };

  // Get performance trend indicator
  const getPerformanceTrend = (campaign) => {
    const currentROAS = campaign.metrics?.roas || 0;
    const previousROAS = campaign.previousMetrics?.roas || currentROAS;

    if (currentROAS > previousROAS) {
      return { trend: 'up', change: '+' + ((currentROAS - previousROAS) / previousROAS * 100).toFixed(1) + '%' };
    } else if (currentROAS < previousROAS) {
      return { trend: 'down', change: '-' + ((previousROAS - currentROAS) / previousROAS * 100).toFixed(1) + '%' };
    }

    return { trend: 'stable', change: '0%' };
  };

  // Campaign Card Component
  const CampaignCard = ({ campaign }) => {
    const platform = platformConfig[campaign.platform] || { icon: '❓', color: '#666', name: 'Unknown' };
    const status = statusConfig[campaign.status] || statusConfig.draft;
    const trend = getPerformanceTrend(campaign);
    const StatusIcon = status.icon;

    return (
      <div style={{
        background: 'rgba(0,255,65,0.1)',
        border: selectedCampaigns.includes(campaign.id) ? '2px solid #00ff41' : '1px solid #333',
        borderRadius: '10px',
        padding: '20px',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        position: 'relative',
        overflow: 'hidden'
      }}
      onClick={() => toggleCampaignSelection(campaign.id)}
      >
        {/* Selection indicator */}
        {selectedCampaigns.includes(campaign.id) && (
          <div style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            background: '#00ff41',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.8rem',
            color: '#000',
            fontWeight: 'bold'
          }}>
            ✓
          </div>
        )}

        {/* Campaign Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '15px'
        }}>
          <div style={{ flex: 1 }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '5px'
            }}>
              <span style={{ fontSize: '1.2rem' }}>{platform.icon}</span>
              <h3 style={{
                margin: 0,
                fontSize: '1.1rem',
                fontWeight: 'bold',
                color: '#00ff41'
              }}>
                {campaign.name}
              </h3>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontSize: '0.8rem',
              opacity: 0.8
            }}>
              <span style={{ color: platform.color }}>{platform.name}</span>
              <span>•</span>
              <span style={{ color: status.color }}>
                <StatusIcon size={12} style={{ marginRight: '4px' }} />
                {status.text}
              </span>
            </div>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedCampaign(campaign);
              setShowOptimizationModal(true);
            }}
            style={{
              background: 'transparent',
              border: '1px solid #00ff41',
              color: '#00ff41',
              borderRadius: '5px',
              padding: '5px',
              cursor: 'pointer'
            }}
          >
            <MoreVertical size={16} />
          </button>
        </div>

        {/* Performance Metrics */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '10px',
          marginBottom: '15px'
        }}>
          <div style={{
            background: 'rgba(0,0,0,0.3)',
            padding: '10px',
            borderRadius: '5px'
          }}>
            <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>ROAS</div>
            <div style={{
              fontSize: '1.3rem',
              fontWeight: 'bold',
              color: (campaign.metrics?.roas || 0) > 2 ? '#00ff41' : '#ffaa00',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}>
              {(campaign.metrics?.roas || 0).toFixed(2)}x
              {trend.trend === 'up' ? (
                <TrendingUp size={14} style={{ color: '#00ff41' }} />
              ) : trend.trend === 'down' ? (
                <TrendingDown size={14} style={{ color: '#ff0040' }} />
              ) : null}
            </div>
          </div>

          <div style={{
            background: 'rgba(0,0,0,0.3)',
            padding: '10px',
            borderRadius: '5px'
          }}>
            <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>SPEND</div>
            <div style={{
              fontSize: '1.3rem',
              fontWeight: 'bold',
              color: '#0099ff'
            }}>
              €{(campaign.metrics?.spend || 0).toFixed(2)}
            </div>
          </div>

          <div style={{
            background: 'rgba(0,0,0,0.3)',
            padding: '10px',
            borderRadius: '5px'
          }}>
            <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>CTR</div>
            <div style={{
              fontSize: '1.3rem',
              fontWeight: 'bold',
              color: (campaign.metrics?.ctr || 0) > 2 ? '#00ff41' : '#ffaa00'
            }}>
              {(campaign.metrics?.ctr || 0).toFixed(2)}%
            </div>
          </div>

          <div style={{
            background: 'rgba(0,0,0,0.3)',
            padding: '10px',
            borderRadius: '5px'
          }}>
            <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>CONV</div>
            <div style={{
              fontSize: '1.3rem',
              fontWeight: 'bold',
              color: '#00ff41'
            }}>
              {campaign.metrics?.conversions || 0}
            </div>
          </div>
        </div>

        {/* Campaign Actions */}
        <div style={{
          display: 'flex',
          gap: '8px',
          fontSize: '0.7rem'
        }}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              console.log('View campaign:', campaign.name);
            }}
            style={{
              flex: 1,
              padding: '6px 12px',
              background: 'transparent',
              border: '1px solid #00ff41',
              color: '#00ff41',
              borderRadius: '4px',
              cursor: 'pointer',
              fontFamily: 'Courier New, monospace',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px'
            }}
          >
            <Eye size={12} />
            VIEW
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              if (onCampaignOptimize) onCampaignOptimize(campaign);
            }}
            style={{
              flex: 1,
              padding: '6px 12px',
              background: '#00ff41',
              border: 'none',
              color: '#000',
              borderRadius: '4px',
              cursor: 'pointer',
              fontFamily: 'Courier New, monospace',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px'
            }}
          >
            <Zap size={12} />
            OPTIMIZE
          </button>
        </div>

        {/* Performance trend */}
        {trend.trend !== 'stable' && (
          <div style={{
            position: 'absolute',
            top: '10px',
            left: '10px',
            padding: '2px 6px',
            background: trend.trend === 'up' ? 'rgba(0,255,65,0.2)' : 'rgba(255,0,64,0.2)',
            border: `1px solid ${trend.trend === 'up' ? '#00ff41' : '#ff0040'}`,
            borderRadius: '3px',
            fontSize: '0.6rem',
            color: trend.trend === 'up' ? '#00ff41' : '#ff0040'
          }}>
            {trend.change}
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{
      background: 'rgba(0,255,65,0.1)',
      border: '1px solid #00ff41',
      borderRadius: '10px',
      padding: '20px',
      fontFamily: 'Courier New, monospace',
      color: '#00ff41'
    }}>

      {/* HEADER */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        paddingBottom: '15px',
        borderBottom: '1px solid #00ff41'
      }}>
        <div>
          <h2 style={{
            margin: 0,
            fontSize: '1.5rem',
            textShadow: '0 0 10px #00ff41'
          }}>
            🚀 CAMPAIGN MANAGEMENT
          </h2>
          <div style={{
            fontSize: '0.9rem',
            opacity: 0.7,
            marginTop: '5px'
          }}>
            {filteredCampaigns.length} campaigns • {selectedCampaigns.length} selected
          </div>
        </div>

        <div style={{
          display: 'flex',
          gap: '10px',
          alignItems: 'center'
        }}>
          <button
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            style={{
              padding: '8px 12px',
              background: 'transparent',
              border: '1px solid #00ff41',
              color: '#00ff41',
              borderRadius: '5px',
              cursor: 'pointer',
              fontFamily: 'Courier New, monospace'
            }}
          >
            {viewMode === 'grid' ? '📋 LIST' : '📊 GRID'}
          </button>

          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '8px 12px',
              background: 'transparent',
              border: '1px solid #00ff41',
              color: '#00ff41',
              borderRadius: '5px',
              cursor: 'pointer',
              fontFamily: 'Courier New, monospace'
            }}
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* FILTERS & ACTIONS */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        flexWrap: 'wrap',
        gap: '10px'
      }}>
        <div style={{
          display: 'flex',
          gap: '10px',
          alignItems: 'center'
        }}>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{
              padding: '6px 10px',
              background: 'rgba(0,0,0,0.5)',
              border: '1px solid #00ff41',
              color: '#00ff41',
              borderRadius: '5px',
              fontFamily: 'Courier New, monospace',
              fontSize: '0.8rem'
            }}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="draft">Draft</option>
            <option value="completed">Completed</option>
          </select>

          <select
            value={filterPlatform}
            onChange={(e) => setFilterPlatform(e.target.value)}
            style={{
              padding: '6px 10px',
              background: 'rgba(0,0,0,0.5)',
              border: '1px solid #00ff41',
              color: '#00ff41',
              borderRadius: '5px',
              fontFamily: 'Courier New, monospace',
              fontSize: '0.8rem'
            }}
          >
            <option value="all">All Platforms</option>
            <option value="google">Google Ads</option>
            <option value="meta">Meta Ads</option>
            <option value="tiktok">TikTok</option>
            <option value="linkedin">LinkedIn</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{
              padding: '6px 10px',
              background: 'rgba(0,0,0,0.5)',
              border: '1px solid #00ff41',
              color: '#00ff41',
              borderRadius: '5px',
              fontFamily: 'Courier New, monospace',
              fontSize: '0.8rem'
            }}
          >
            <option value="performance">Sort by Performance</option>
            <option value="spend">Sort by Spend</option>
            <option value="name">Sort by Name</option>
            <option value="created">Sort by Created</option>
          </select>
        </div>

        {/* BULK ACTIONS */}
        {selectedCampaigns.length > 0 && (
          <div style={{
            display: 'flex',
            gap: '8px'
          }}>
            <button
              onClick={() => handleBulkAction('activate')}
              style={{
                padding: '6px 12px',
                background: '#00ff41',
                color: '#000',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontFamily: 'Courier New, monospace',
                fontSize: '0.8rem',
                fontWeight: 'bold'
              }}
            >
              ▶ ACTIVATE
            </button>

            <button
              onClick={() => handleBulkAction('pause')}
              style={{
                padding: '6px 12px',
                background: 'transparent',
                border: '1px solid #ffaa00',
                color: '#ffaa00',
                borderRadius: '4px',
                cursor: 'pointer',
                fontFamily: 'Courier New, monospace',
                fontSize: '0.8rem'
              }}
            >
              ⏸ PAUSE
            </button>

            <button
              onClick={() => handleBulkAction('optimize')}
              style={{
                padding: '6px 12px',
                background: 'transparent',
                border: '1px solid #0099ff',
                color: '#0099ff',
                borderRadius: '4px',
                cursor: 'pointer',
                fontFamily: 'Courier New, monospace',
                fontSize: '0.8rem'
              }}
            >
              ⚡ OPTIMIZE
            </button>

            <button
              onClick={() => handleBulkAction('delete')}
              style={{
                padding: '6px 12px',
                background: 'transparent',
                border: '1px solid #ff0040',
                color: '#ff0040',
                borderRadius: '4px',
                cursor: 'pointer',
                fontFamily: 'Courier New, monospace',
                fontSize: '0.8rem'
              }}
            >
              🗑 DELETE
            </button>
          </div>
        )}
      </div>

      {/* SELECT ALL */}
      {filteredCampaigns.length > 0 && (
        <div style={{
          marginBottom: '15px'
        }}>
          <button
            onClick={selectAllCampaigns}
            style={{
              padding: '4px 8px',
              background: 'transparent',
              border: '1px solid #00ff41',
              color: '#00ff41',
              borderRadius: '3px',
              cursor: 'pointer',
              fontFamily: 'Courier New, monospace',
              fontSize: '0.7rem'
            }}
          >
            {selectedCampaigns.length === filteredCampaigns.length ? '☑ DESELECT ALL' : '☐ SELECT ALL'}
          </button>
        </div>
      )}

      {/* CAMPAIGNS GRID */}
      {filteredCampaigns.length > 0 ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: viewMode === 'grid'
            ? 'repeat(auto-fit, minmax(300px, 1fr))'
            : '1fr',
          gap: '15px'
        }}>
          {filteredCampaigns.map(campaign => (
            <CampaignCard key={campaign.id} campaign={campaign} />
          ))}
        </div>
      ) : (
        <div style={{
          textAlign: 'center',
          padding: '40px',
          opacity: 0.7
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '10px' }}>📭</div>
          <div style={{ fontSize: '1.1rem', marginBottom: '5px' }}>No campaigns found</div>
          <div style={{ fontSize: '0.9rem' }}>Create your first campaign to get started!</div>
        </div>
      )}

      {/* OPTIMIZATION MODAL */}
      {showOptimizationModal && selectedCampaign && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #0a0a0a 100%)',
            border: '2px solid #00ff41',
            borderRadius: '10px',
            padding: '30px',
            maxWidth: '500px',
            width: '90%'
          }}>
            <h3 style={{
              margin: '0 0 20px 0',
              color: '#00ff41',
              textAlign: 'center'
            }}>
              ⚡ OPTIMIZE CAMPAIGN
            </h3>

            <div style={{
              textAlign: 'center',
              marginBottom: '20px'
            }}>
              <div style={{ fontSize: '1.1rem', marginBottom: '10px' }}>
                {selectedCampaign.name}
              </div>
              <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>
                Marcus will analyze and optimize this campaign
              </div>
            </div>

            <div style={{
              display: 'flex',
              gap: '15px',
              justifyContent: 'center'
            }}>
              <button
                onClick={() => {
                  if (onCampaignOptimize) onCampaignOptimize(selectedCampaign);
                  setShowOptimizationModal(false);
                }}
                style={{
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
                ⚡ OPTIMIZE NOW
              </button>

              <button
                onClick={() => setShowOptimizationModal(false)}
                style={{
                  padding: '10px 20px',
                  background: 'transparent',
                  border: '1px solid #00ff41',
                  color: '#00ff41',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontFamily: 'Courier New, monospace'
                }}
              >
                CANCEL
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CampaignManager;