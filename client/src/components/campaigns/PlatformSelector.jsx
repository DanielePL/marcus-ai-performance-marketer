// client/src/components/campaigns/PlatformSelector.jsx
// Platform Selection mit Marcus AI Bewertung + Media Upload
import React, { useState, useEffect } from 'react';
import openaiService from '../../services/openai.js';

const PlatformSelector = ({ onPlatformChange, campaignData = {} }) => {
  const [selectedPlatforms, setSelectedPlatforms] = useState([]);
  const [marcusRecommendation, setMarcusRecommendation] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadedMedia, setUploadedMedia] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  // Available Platforms mit Kosten & Features
  const platforms = {
    google_ads: {
      name: 'Google Ads',
      icon: '🔍',
      color: '#4285f4',
      features: ['Search Ads', 'Display Network', 'YouTube Ads', 'Shopping Ads'],
      avgCPC: '€0.50-€2.00',
      reach: '4.3B Users',
      bestFor: 'Intent-based Marketing, High-converting Traffic'
    },
    meta_ads: {
      name: 'Meta Ads (Facebook/Instagram)',
      icon: '📘',
      color: '#1877f2',
      features: ['Facebook Feed', 'Instagram Stories', 'Reels', 'Messenger'],
      avgCPC: '€0.30-€1.50',
      reach: '3.8B Users',
      bestFor: 'Brand Awareness, Visual Content, Retargeting'
    },
    instagram_api: {
      name: 'Instagram Direct Post',
      icon: '📸',
      color: '#e4405f',
      features: ['Organic Posts', 'Stories', 'Reels', 'IGTV'],
      avgCPC: 'Free (Organic)',
      reach: '2B Users',
      bestFor: 'Content Marketing, Organic Engagement'
    },
    tiktok_ads: {
      name: 'TikTok Ads',
      icon: '🎵',
      color: '#ff0050',
      features: ['In-Feed Videos', 'Spark Ads', 'Brand Takeover'],
      avgCPC: '€0.20-€1.00',
      reach: '1B Users',
      bestFor: 'Gen Z/Millennials, Viral Content'
    },
    linkedin_ads: {
      name: 'LinkedIn Ads',
      icon: '💼',
      color: '#0077b5',
      features: ['Sponsored Content', 'Message Ads', 'Lead Gen'],
      avgCPC: '€2.00-€8.00',
      reach: '900M Professionals',
      bestFor: 'B2B Marketing, Professional Services'
    },
    youtube_ads: {
      name: 'YouTube Ads',
      icon: '🎥',
      color: '#ff0000',
      features: ['Pre-roll', 'Mid-roll', 'Display Ads', 'Shorts'],
      avgCPC: '€0.10-€0.30',
      reach: '2.7B Users',
      bestFor: 'Video Marketing, Educational Content'
    }
  };

  // Marcus analysiert Platform-Auswahl
  const analyzePlatformSelection = async (platforms) => {
    if (platforms.length === 0) {
      setMarcusRecommendation(null);
      return;
    }

    setIsAnalyzing(true);

    try {
      const analysisPrompt = `
PLATFORM ANALYSE für Kampagne:

GEWÄHLTE PLATFORMS: ${platforms.join(', ')}
CAMPAIGN DATA: ${JSON.stringify(campaignData, null, 2)}

Bewerte diese Platform-Auswahl:
1. Ist das eine gute Kombination?
2. Welche Platforms fehlen oder sind überflüssig?
3. Budget-Verteilung Empfehlung
4. Warum ist das gut/schlecht?
5. Was wäre deine OPTIMALE Kombination?

Format: Kurz und prägnant mit Empfehlung.`;

      const response = await openaiService.chatWithMarcus(analysisPrompt);

      if (response.success) {
        setMarcusRecommendation({
          analysis: response.response,
          selectedPlatforms: platforms,
          timestamp: new Date().toISOString(),
          confidence: calculateConfidence(platforms, campaignData)
        });
      }
    } catch (error) {
      console.error('❌ Platform Analysis Error:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Confidence Score basierend auf Platform + Campaign Match
  const calculateConfidence = (platforms, campaign) => {
    let score = 50; // Base score

    // Campaign Type Match
    if (campaign.objective === 'brand_awareness' && platforms.includes('meta_ads')) score += 20;
    if (campaign.objective === 'conversions' && platforms.includes('google_ads')) score += 25;
    if (campaign.objective === 'engagement' && platforms.includes('instagram_api')) score += 15;

    // Budget Match
    if (campaign.budget > 1000 && platforms.includes('google_ads')) score += 10;
    if (campaign.budget < 500 && platforms.includes('instagram_api')) score += 15;

    // Platform Diversity
    if (platforms.length === 2) score += 10;
    if (platforms.length === 3) score += 5;
    if (platforms.length > 4) score -= 15;

    return Math.min(100, Math.max(0, score));
  };

  // Platform Selection Handler
  const handlePlatformToggle = (platformKey) => {
    const updatedPlatforms = selectedPlatforms.includes(platformKey)
      ? selectedPlatforms.filter(p => p !== platformKey)
      : [...selectedPlatforms, platformKey];

    setSelectedPlatforms(updatedPlatforms);
    onPlatformChange(updatedPlatforms);
  };

  // Marcus Empfehlung übernehmen
  const acceptMarcusRecommendation = async () => {
    const optimalPlatforms = await getMarcusOptimalPlatforms();
    setSelectedPlatforms(optimalPlatforms);
    onPlatformChange(optimalPlatforms);
  };

  const getMarcusOptimalPlatforms = async () => {
    // Simplified logic - in real app, parse Marcus response
    const { objective, budget, targetAudience } = campaignData;

    if (objective === 'conversions' && budget > 500) return ['google_ads', 'meta_ads'];
    if (objective === 'brand_awareness') return ['meta_ads', 'instagram_api', 'tiktok_ads'];
    if (objective === 'engagement') return ['instagram_api', 'tiktok_ads'];
    if (targetAudience?.includes('professional')) return ['linkedin_ads', 'google_ads'];

    return ['google_ads', 'meta_ads']; // Default
  };

  // Media Upload Handler
  const handleMediaUpload = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    setIsUploading(true);

    try {
      const uploadPromises = files.map(async (file) => {
        // Create preview
        const preview = await createFilePreview(file);

        // TODO: Upload to your server/cloud storage
        // const uploadResponse = await uploadToStorage(file);

        return {
          id: Date.now() + Math.random(),
          file: file,
          name: file.name,
          type: file.type,
          size: file.size,
          preview: preview,
          uploaded: false, // Will be true after server upload
          url: null // Will be set after upload
        };
      });

      const mediaItems = await Promise.all(uploadPromises);
      setUploadedMedia(prev => [...prev, ...mediaItems]);

    } catch (error) {
      console.error('❌ Media Upload Error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  // Create File Preview
  const createFilePreview = (file) => {
    return new Promise((resolve) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.readAsDataURL(file);
      } else if (file.type.startsWith('video/')) {
        const video = document.createElement('video');
        video.src = URL.createObjectURL(file);
        video.addEventListener('loadedmetadata', () => {
          video.currentTime = 1; // Get frame at 1 second
        });
        video.addEventListener('seeked', () => {
          const canvas = document.createElement('canvas');
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(video, 0, 0);
          resolve(canvas.toDataURL());
        });
      } else {
        resolve(null); // No preview for other file types
      }
    });
  };

  // Remove Media Item
  const removeMediaItem = (id) => {
    setUploadedMedia(prev => prev.filter(item => item.id !== id));
  };

  // Auto-analyze when platforms change
  useEffect(() => {
    if (selectedPlatforms.length > 0) {
      const debounceTimer = setTimeout(() => {
        analyzePlatformSelection(selectedPlatforms);
      }, 1000);

      return () => clearTimeout(debounceTimer);
    }
  }, [selectedPlatforms, campaignData]);

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
        alignItems: 'center',
        gap: '10px',
        marginBottom: '20px',
        fontSize: '1.2rem',
        fontWeight: 'bold'
      }}>
        🎯 PLATFORM SELECTION + MEDIA UPLOAD
        {isAnalyzing && (
          <div style={{
            fontSize: '0.9rem',
            color: '#ffaa00',
            display: 'flex',
            alignItems: 'center',
            gap: '5px'
          }}>
            <div style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              background: '#ffaa00',
              animation: 'pulse 1s infinite'
            }} />
            MARCUS ANALYSIERT...
          </div>
        )}
      </div>

      {/* PLATFORM GRID */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '15px',
        marginBottom: '20px'
      }}>
        {Object.entries(platforms).map(([key, platform]) => {
          const isSelected = selectedPlatforms.includes(key);

          return (
            <div
              key={key}
              onClick={() => handlePlatformToggle(key)}
              style={{
                padding: '15px',
                border: `2px solid ${isSelected ? platform.color : '#333'}`,
                borderRadius: '8px',
                background: isSelected
                  ? `rgba(${hexToRgb(platform.color)}, 0.2)`
                  : 'rgba(0,0,0,0.3)',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                boxShadow: isSelected ? `0 0 20px ${platform.color}` : 'none'
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                marginBottom: '10px'
              }}>
                <span style={{ fontSize: '1.5rem' }}>{platform.icon}</span>
                <span style={{
                  fontWeight: 'bold',
                  color: isSelected ? platform.color : '#00ff41'
                }}>
                  {platform.name}
                </span>
                {isSelected && (
                  <span style={{
                    marginLeft: 'auto',
                    color: platform.color,
                    fontSize: '1.2rem'
                  }}>
                    ✓
                  </span>
                )}
              </div>

              <div style={{ fontSize: '0.8rem', opacity: 0.8, marginBottom: '8px' }}>
                <div>💰 {platform.avgCPC}</div>
                <div>👥 {platform.reach}</div>
              </div>

              <div style={{ fontSize: '0.7rem', opacity: 0.6 }}>
                {platform.bestFor}
              </div>

              <div style={{
                marginTop: '8px',
                display: 'flex',
                flexWrap: 'wrap',
                gap: '4px'
              }}>
                {platform.features.slice(0, 2).map(feature => (
                  <span
                    key={feature}
                    style={{
                      padding: '2px 6px',
                      background: 'rgba(0,255,65,0.2)',
                      borderRadius: '3px',
                      fontSize: '0.6rem'
                    }}
                  >
                    {feature}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* MARCUS RECOMMENDATION */}
      {marcusRecommendation && (
        <div style={{
          background: 'rgba(0,255,65,0.2)',
          border: '1px solid #00ff41',
          borderRadius: '8px',
          padding: '15px',
          marginBottom: '20px'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '10px'
          }}>
            <span style={{ fontWeight: 'bold' }}>
              🤖 MARCUS ANALYSE
            </span>
            <div style={{
              padding: '4px 8px',
              background: `rgba(0,255,65,${marcusRecommendation.confidence / 100})`,
              borderRadius: '4px',
              fontSize: '0.8rem'
            }}>
              {marcusRecommendation.confidence}% MATCH
            </div>
          </div>

          <div style={{
            fontSize: '0.9rem',
            lineHeight: '1.4',
            marginBottom: '10px'
          }}>
            {marcusRecommendation.analysis}
          </div>

          <button
            onClick={acceptMarcusRecommendation}
            style={{
              padding: '8px 16px',
              background: '#00ff41',
              color: '#000',
              border: 'none',
              borderRadius: '4px',
              fontFamily: 'Courier New, monospace',
              fontWeight: 'bold',
              cursor: 'pointer',
              fontSize: '0.8rem',
              textTransform: 'uppercase'
            }}
          >
            🎯 MARCUS EMPFEHLUNG ÜBERNEHMEN
          </button>
        </div>
      )}

      {/* MEDIA UPLOAD SECTION */}
      <div style={{
        background: 'rgba(0,255,65,0.1)',
        border: '1px dashed #00ff41',
        borderRadius: '8px',
        padding: '20px',
        textAlign: 'center',
        marginBottom: '20px'
      }}>
        <div style={{
          fontSize: '1.1rem',
          fontWeight: 'bold',
          marginBottom: '10px'
        }}>
          📸 MEDIA UPLOAD (Bilder & Videos)
        </div>

        <input
          type="file"
          multiple
          accept="image/*,video/*"
          onChange={handleMediaUpload}
          style={{ display: 'none' }}
          id="media-upload"
        />

        <label
          htmlFor="media-upload"
          style={{
            display: 'inline-block',
            padding: '10px 20px',
            background: 'transparent',
            border: '2px solid #00ff41',
            color: '#00ff41',
            borderRadius: '5px',
            cursor: 'pointer',
            fontFamily: 'Courier New, monospace',
            fontSize: '0.9rem',
            textTransform: 'uppercase'
          }}
        >
          {isUploading ? '⏳ UPLOADING...' : '📎 MEDIA HINZUFÜGEN'}
        </label>

        <div style={{
          fontSize: '0.8rem',
          opacity: 0.7,
          marginTop: '8px'
        }}>
          Unterstützt: JPG, PNG, MP4, MOV (Max 50MB)
        </div>
      </div>

      {/* UPLOADED MEDIA PREVIEW */}
      {uploadedMedia.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
          gap: '10px',
          marginBottom: '20px'
        }}>
          {uploadedMedia.map((media) => (
            <div
              key={media.id}
              style={{
                position: 'relative',
                aspectRatio: '1',
                border: '1px solid #00ff41',
                borderRadius: '5px',
                overflow: 'hidden',
                background: 'rgba(0,0,0,0.5)'
              }}
            >
              {media.preview && (
                <img
                  src={media.preview}
                  alt={media.name}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
              )}

              <button
                onClick={() => removeMediaItem(media.id)}
                style={{
                  position: 'absolute',
                  top: '5px',
                  right: '5px',
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  background: '#ff0040',
                  color: '#fff',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ×
              </button>

              <div style={{
                position: 'absolute',
                bottom: '0',
                left: '0',
                right: '0',
                background: 'rgba(0,0,0,0.8)',
                padding: '4px',
                fontSize: '0.6rem',
                textAlign: 'center'
              }}>
                {media.name.length > 15 ? media.name.substring(0, 12) + '...' : media.name}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SELECTED PLATFORMS SUMMARY */}
      {selectedPlatforms.length > 0 && (
        <div style={{
          padding: '15px',
          background: 'rgba(0,255,65,0.2)',
          borderRadius: '5px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <span>🎯 AUSGEWÄHLT:</span>
          {selectedPlatforms.map(platformKey => (
            <span
              key={platformKey}
              style={{
                padding: '4px 8px',
                background: platforms[platformKey].color,
                color: '#fff',
                borderRadius: '4px',
                fontSize: '0.8rem',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              {platforms[platformKey].icon} {platforms[platformKey].name}
            </span>
          ))}
        </div>
      )}

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

// Helper function to convert hex to rgb
const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return '0,0,0';

  const r = parseInt(result[1], 16);
  const g = parseInt(result[2], 16);
  const b = parseInt(result[3], 16);

  return `${r},${g},${b}`;
};

export default PlatformSelector;