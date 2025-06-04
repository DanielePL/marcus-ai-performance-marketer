// client/src/components/campaigns/CampaignCreator.jsx
// Campaign Creation Wizard mit Marcus AI Integration
import React, { useState, useEffect } from 'react';
import PlatformSelector from './PlatformSelector.jsx';
import openaiService from '../../services/openai.js';

const CampaignCreator = ({ onCampaignCreate, onClose }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isCreating, setIsCreating] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [marcusAdvice, setMarcusAdvice] = useState(null);

  // Campaign Data State
  const [campaignData, setCampaignData] = useState({
    name: '',
    objective: '',
    budget: '',
    duration: '7',
    targetAudience: '',
    description: '',
    platforms: [],
    media: [],
    schedule: {
      startDate: '',
      endDate: '',
      timezone: 'Europe/Zurich'
    },
    advanced: {
      bidStrategy: 'automatic',
      optimization: 'conversions',
      frequency: 'normal'
    }
  });

  const steps = [
    { id: 1, name: 'GRUNDDATEN', icon: '📝' },
    { id: 2, name: 'ZIELGRUPPE', icon: '🎯' },
    { id: 3, name: 'PLATTFORMEN', icon: '📱' },
    { id: 4, name: 'BUDGET & ZEIT', icon: '💰' },
    { id: 5, name: 'FINAL CHECK', icon: '✅' }
  ];

  const objectives = {
    brand_awareness: { name: 'Brand Awareness', icon: '👁️', description: 'Markenbekanntheit steigern' },
    traffic: { name: 'Website Traffic', icon: '🔗', description: 'Mehr Besucher auf Website' },
    engagement: { name: 'Engagement', icon: '❤️', description: 'Likes, Shares, Comments' },
    conversions: { name: 'Conversions', icon: '🛒', description: 'Verkäufe & Leads generieren' },
    app_installs: { name: 'App Installs', icon: '📱', description: 'App Downloads steigern' },
    video_views: { name: 'Video Views', icon: '🎥', description: 'Video Content bewerben' }
  };

  // Marcus gibt Live-Feedback zu Campaign Setup
  const getMarcusAdvice = async (step, data) => {
    try {
      const prompts = {
        1: `Bewerte diese Campaign Grunddaten: Name: "${data.name}", Ziel: "${data.objective}", Beschreibung: "${data.description}". Ist das gut definiert?`,
        2: `Analyse der Zielgruppe: "${data.targetAudience}". Ist das spezifisch genug für effektives Targeting?`,
        3: `Platform Mix: ${data.platforms.join(', ')}. Passt das zum Ziel "${data.objective}" und Budget ${data.budget}€?`,
        4: `Budget ${data.budget}€ für ${data.duration} Tage. Ist das realistisch für die gewählten Platforms?`,
        5: `Final Check der kompletten Campaign. Gib eine Erfolgs-Prognose und letzte Optimierungsvorschläge.`
      };

      const response = await openaiService.chatWithMarcus(prompts[step], { campaign: data });

      if (response.success) {
        setMarcusAdvice({
          step: step,
          advice: response.response,
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('❌ Marcus Advice Error:', error);
    }
  };

  // Auto-Marcus Advice when step changes
  useEffect(() => {
    if (currentStep > 1) {
      const timer = setTimeout(() => getMarcusAdvice(currentStep, campaignData), 1000);
      return () => clearTimeout(timer);
    }
  }, [currentStep, campaignData]);

  // Handle Form Updates
  const updateCampaignData = (field, value) => {
    setCampaignData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const updateNestedData = (parent, field, value) => {
    setCampaignData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value
      }
    }));
  };

  // Step Navigation
  const nextStep = () => {
    console.log('🔥 Next Step clicked! Current:', currentStep, 'Max:', steps.length);
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
      console.log('✅ Moving to step:', currentStep + 1);
    }
  };

  const prevStep = () => {
    console.log('🔙 Prev Step clicked! Current:', currentStep);
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      console.log('✅ Moving to step:', currentStep - 1);
    }
  };

  // Platform Selection Handler
  const handlePlatformChange = (platforms) => {
    updateCampaignData('platforms', platforms);
  };

  // Create Campaign
  const createCampaign = async () => {
    setIsCreating(true);

    try {
      // TODO: API Call to create campaign
      // const response = await fetch('/api/campaigns', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(campaignData)
      // });

      console.log('🚀 Creating Campaign:', campaignData);

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      onCampaignCreate(campaignData);

    } catch (error) {
      console.error('❌ Campaign Creation Error:', error);
    } finally {
      setIsCreating(false);
    }
  };

  // Step Content Renderer
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                🏷️ CAMPAIGN NAME
              </label>
              <input
                type="text"
                value={campaignData.name}
                onChange={(e) => updateCampaignData('name', e.target.value)}
                placeholder="z.B. 'Summer Sale 2025' oder 'App Launch Q2'"
                style={inputStyle}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                🎯 CAMPAIGN ZIELE (MEHRFACH-AUSWAHL MÖGLICH!)
              </label>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '10px'
              }}>
                {Object.entries(objectives).map(([key, obj]) => {
                  const isSelected = Array.isArray(campaignData.objective)
                    ? campaignData.objective.includes(key)
                    : campaignData.objective === key;

                  return (
                    <div
                      key={key}
                      onClick={() => {
                        const currentObjectives = Array.isArray(campaignData.objective)
                          ? campaignData.objective
                          : campaignData.objective ? [campaignData.objective] : [];

                        const updatedObjectives = isSelected
                          ? currentObjectives.filter(o => o !== key)
                          : [...currentObjectives, key];

                        updateCampaignData('objective', updatedObjectives);
                      }}
                      style={{
                        padding: '15px',
                        border: isSelected ? '2px solid #00ff41' : '1px solid #333',
                        borderRadius: '8px',
                        background: isSelected ? 'rgba(0,255,65,0.2)' : 'rgba(0,0,0,0.3)',
                        cursor: 'pointer',
                        textAlign: 'center',
                        position: 'relative'
                      }}
                    >
                      {isSelected && (
                        <div style={{
                          position: 'absolute',
                          top: '5px',
                          right: '5px',
                          background: '#00ff41',
                          color: '#000',
                          borderRadius: '50%',
                          width: '20px',
                          height: '20px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.8rem',
                          fontWeight: 'bold'
                        }}>
                          ✓
                        </div>
                      )}
                      <div style={{ fontSize: '1.5rem', marginBottom: '5px' }}>{obj.icon}</div>
                      <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>{obj.name}</div>
                      <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>{obj.description}</div>
                    </div>
                  );
                })}
              </div>

              {Array.isArray(campaignData.objective) && campaignData.objective.length > 1 && (
                <div style={{
                  marginTop: '10px',
                  padding: '10px',
                  background: 'rgba(0,255,65,0.1)',
                  borderRadius: '5px',
                  fontSize: '0.9rem'
                }}>
                  🎯 <strong>COMBI-ZIEL:</strong> {campaignData.objective.map(obj => objectives[obj]?.name).join(' + ')}
                  <br />
                  💡 Marcus wird Budget optimal auf mehrere Ziele verteilen!
                </div>
              )}
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                📄 BESCHREIBUNG
              </label>
              <textarea
                value={campaignData.description}
                onChange={(e) => updateCampaignData('description', e.target.value)}
                placeholder="Beschreibe dein Produkt/Service und was du erreichen willst..."
                rows="4"
                style={{...inputStyle, resize: 'vertical'}}
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '8px'
              }}>
                <label style={{ fontWeight: 'bold' }}>
                  👥 ZIELGRUPPE DEFINIEREN
                </label>
                <button
                  onClick={async () => {
                    setIsAnalyzing(true);
                    try {
                      const response = await openaiService.chatWithMarcus(
                        `Erstelle eine präzise Zielgruppendefinition für diese Campaign: 
                        Produktname: "${campaignData.name}"
                        Beschreibung: "${campaignData.description}"
                        Ziele: ${Array.isArray(campaignData.objective) ? campaignData.objective.join(', ') : campaignData.objective}
                        
                        Gib eine konkrete Zielgruppe zurück mit: Alter, Geschlecht, Interessen, Einkommen, Standort.`
                      );

                      if (response.success) {
                        // Extract suggested audience from Marcus response
                        updateCampaignData('targetAudience', response.response);
                      }
                    } catch (error) {
                      console.error('Marcus Audience Error:', error);
                    } finally {
                      setIsAnalyzing(false);
                    }
                  }}
                  disabled={!campaignData.name || !campaignData.description}
                  style={{
                    padding: '8px 16px',
                    background: '#00ff41',
                    color: '#000',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    fontFamily: 'Courier New, monospace',
                    fontSize: '0.8rem',
                    fontWeight: 'bold',
                    opacity: (!campaignData.name || !campaignData.description) ? 0.5 : 1
                  }}
                >
                  {isAnalyzing ? '🤖 ANALYSIERT...' : '🎯 MARCUS HELFEN LASSEN'}
                </button>
              </div>

              <textarea
                value={campaignData.targetAudience}
                onChange={(e) => updateCampaignData('targetAudience', e.target.value)}
                placeholder="z.B. 'Frauen 25-45, interessiert an Fitness, Einkommen 40k+, wohnhaft in DACH'"
                rows="6"
                style={{...inputStyle, resize: 'vertical'}}
              />
              <div style={{ fontSize: '0.8rem', opacity: 0.7, marginTop: '8px' }}>
                💡 Tipp: Je spezifischer, desto besser. Marcus kann dir eine perfekte Zielgruppe vorschlagen!
              </div>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '15px'
            }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                  🌍 REGION
                </label>
                <select
                  style={inputStyle}
                  onChange={(e) => updateNestedData('targeting', 'region', e.target.value)}
                >
                  <option value="">Wählen...</option>
                  <option value="dach">DACH (DE, AT, CH)</option>
                  <option value="germany">Deutschland</option>
                  <option value="austria">Österreich</option>
                  <option value="switzerland">Schweiz</option>
                  <option value="europe">Europa</option>
                  <option value="global">Global</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                  🎂 ALTER
                </label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <input
                    type="number"
                    placeholder="Von"
                    min="18"
                    max="65"
                    style={{...inputStyle, width: '80px'}}
                    onChange={(e) => updateNestedData('targeting', 'ageMin', e.target.value)}
                  />
                  <span style={{
                    alignSelf: 'center',
                    color: '#00ff41',
                    fontWeight: 'bold'
                  }}>
                    bis
                  </span>
                  <input
                    type="number"
                    placeholder="Bis"
                    min="18"
                    max="65"
                    style={{...inputStyle, width: '80px'}}
                    onChange={(e) => updateNestedData('targeting', 'ageMax', e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                  ⚧️ GESCHLECHT
                </label>
                <select
                  style={inputStyle}
                  onChange={(e) => updateNestedData('targeting', 'gender', e.target.value)}
                >
                  <option value="all">Alle</option>
                  <option value="male">Männlich</option>
                  <option value="female">Weiblich</option>
                </select>
              </div>
            </div>

            {/* MARCUS QUICK AUDIENCE SUGGESTIONS */}
            <div style={{
              padding: '15px',
              background: 'rgba(0,255,65,0.1)',
              border: '1px solid #00ff41',
              borderRadius: '8px'
            }}>
              <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>
                🤖 MARCUS QUICK-ZIELGRUPPEN
              </div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                gap: '8px'
              }}>
                {[
                  { name: 'E-Commerce Standard', audience: 'Frauen & Männer 25-45, mittleres Einkommen, online-affin, DACH-Region' },
                  { name: 'Premium Produkte', audience: 'Männer & Frauen 30-55, hohes Einkommen 60k+, Luxus-interessiert, urbane Gebiete' },
                  { name: 'Tech Early Adopters', audience: 'Männer 20-40, Tech-interessiert, hohes Einkommen, Metropolregionen' },
                  { name: 'Health & Fitness', audience: 'Frauen 25-40, fitness-interessiert, mittleres bis hohes Einkommen, gesundheitsbewusst' },
                  { name: 'B2B Entscheider', audience: 'Männer & Frauen 30-50, Führungsposition, Unternehmensgröße 50+, DACH-Raum' },
                  { name: 'Gen Z Mobile', audience: 'Männer & Frauen 16-25, mobile-first, social media aktiv, trendbewusst' }
                ].map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => updateCampaignData('targetAudience', suggestion.audience)}
                    style={{
                      padding: '8px 12px',
                      background: 'transparent',
                      border: '1px solid #00ff41',
                      color: '#00ff41',
                      borderRadius: '5px',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      textAlign: 'left',
                      fontFamily: 'Courier New, monospace'
                    }}
                  >
                    {suggestion.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <PlatformSelector
            onPlatformChange={handlePlatformChange}
            campaignData={campaignData}
          />
        );

      case 4:
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '20px'
            }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                  💰 TAGESBUDGET (EUR)
                </label>
                <input
                  type="number"
                  value={campaignData.budget}
                  onChange={(e) => updateCampaignData('budget', e.target.value)}
                  placeholder="z.B. 50"
                  min="1"
                  style={inputStyle}
                />
                <div style={{ fontSize: '0.8rem', opacity: 0.7, marginTop: '4px' }}>
                  Min: €10/Tag für effektive Campaigns
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                  📅 LAUFZEIT (TAGE)
                </label>
                <input
                  type="number"
                  value={campaignData.duration}
                  onChange={(e) => updateCampaignData('duration', e.target.value)}
                  placeholder="z.B. 14"
                  min="1"
                  max="90"
                  style={inputStyle}
                />
              </div>
            </div>

            <div style={{
              padding: '15px',
              background: 'rgba(0,255,65,0.1)',
              borderRadius: '8px',
              border: '1px solid #00ff41'
            }}>
              <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>
                💡 BUDGET ÜBERSICHT
              </div>
              <div style={{ fontSize: '0.9rem' }}>
                <div>📊 Tagesbudget: €{campaignData.budget || 0}</div>
                <div>📈 Gesamtbudget: €{(campaignData.budget || 0) * (campaignData.duration || 1)}</div>
                <div>🎯 Platforms: {campaignData.platforms.length} ausgewählt</div>
                <div>💸 Budget pro Platform: ~€{campaignData.platforms.length > 0 ? Math.round((campaignData.budget || 0) / campaignData.platforms.length) : 0}/Tag</div>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                📅 START DATUM
              </label>
              <input
                type="datetime-local"
                value={campaignData.schedule.startDate}
                onChange={(e) => updateNestedData('schedule', 'startDate', e.target.value)}
                style={inputStyle}
                min={new Date().toISOString().slice(0, 16)}
              />
            </div>
          </div>
        );

      case 5:
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{
              padding: '20px',
              background: 'rgba(0,255,65,0.1)',
              border: '1px solid #00ff41',
              borderRadius: '10px'
            }}>
              <h3 style={{ marginBottom: '15px', color: '#00ff41' }}>
                🎯 CAMPAIGN ÜBERSICHT
              </h3>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '15px'
              }}>
                <div>
                  <strong>📝 Name:</strong><br />
                  {campaignData.name || 'Unbenannt'}
                </div>
                <div>
                  <strong>🎯 Ziel:</strong><br />
                  {objectives[campaignData.objective]?.name || 'Nicht gewählt'}
                </div>
                <div>
                  <strong>💰 Budget:</strong><br />
                  €{campaignData.budget}/Tag × {campaignData.duration} Tage = €{(campaignData.budget || 0) * (campaignData.duration || 1)}
                </div>
                <div>
                  <strong>📱 Platforms:</strong><br />
                  {campaignData.platforms.length} ausgewählt
                </div>
              </div>

              <div style={{ marginTop: '15px' }}>
                <strong>👥 Zielgruppe:</strong><br />
                <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>
                  {campaignData.targetAudience || 'Nicht definiert'}
                </div>
              </div>
            </div>

            {isCreating && (
              <div style={{
                padding: '20px',
                textAlign: 'center',
                background: 'rgba(0,255,65,0.2)',
                borderRadius: '10px'
              }}>
                <div style={{
                  fontSize: '1.2rem',
                  marginBottom: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px'
                }}>
                  <div style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    background: '#00ff41',
                    animation: 'pulse 1s infinite'
                  }} />
                  🤖 MARCUS ERSTELLT CAMPAIGN...
                </div>
                <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>
                  Konfiguriere APIs, erstelle Zielgruppen, optimiere Budgets...
                </div>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '10px',
    background: 'rgba(0,0,0,0.5)',
    border: '1px solid #00ff41',
    borderRadius: '5px',
    color: '#00ff41',
    fontFamily: 'Courier New, monospace',
    fontSize: '1rem'
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(0,0,0,0.9)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      fontFamily: 'Courier New, monospace',
      color: '#00ff41'
    }}>
      <div style={{
        width: '90%',
        maxWidth: '800px',
        height: '90%',
        background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #0a0a0a 100%)',
        border: '2px solid #00ff41',
        borderRadius: '15px',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>

        {/* HEADER */}
        <div style={{
          padding: '20px',
          borderBottom: '1px solid #00ff41',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h2 style={{
            margin: 0,
            fontSize: '1.5rem',
            textShadow: '0 0 10px #00ff41'
          }}>
            🚀 NEUE CAMPAIGN ERSTELLEN
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: '1px solid #ff0040',
              color: '#ff0040',
              padding: '8px 12px',
              borderRadius: '5px',
              cursor: 'pointer',
              fontFamily: 'Courier New, monospace'
            }}
          >
            ✕ SCHLIESSEN
          </button>
        </div>

        {/* STEP INDICATOR */}
        <div style={{
          padding: '15px 20px',
          borderBottom: '1px solid #00ff41',
          display: 'flex',
          justifyContent: 'space-between',
          background: 'rgba(0,255,65,0.1)'
        }}>
          {steps.map((step, index) => (
            <div
              key={step.id}
              onClick={() => {
                console.log('🎯 Step clicked:', step.id);
                setCurrentStep(step.id);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                opacity: currentStep >= step.id ? 1 : 0.5,
                color: currentStep === step.id ? '#00ff41' : '#666',
                cursor: 'pointer',
                padding: '5px 10px',
                borderRadius: '5px',
                background: currentStep === step.id ? 'rgba(0,255,65,0.2)' : 'transparent'
              }}
            >
              <span style={{ fontSize: '1.2rem' }}>{step.icon}</span>
              <span style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>
                {step.name}
              </span>
              {index < steps.length - 1 && (
                <span style={{ margin: '0 10px', opacity: 0.3 }}>→</span>
              )}
            </div>
          ))}
        </div>

        {/* CONTENT */}
        <div style={{
          flex: 1,
          padding: '20px',
          overflowY: 'auto'
        }}>
          {/* DEBUG INFO */}
          <div style={{
            marginBottom: '15px',
            padding: '10px',
            background: 'rgba(255,255,0,0.1)',
            border: '1px solid #ffaa00',
            borderRadius: '5px',
            fontSize: '0.8rem',
            color: '#ffaa00'
          }}>
            🔧 DEBUG: Current Step = {currentStep} | Total Steps = {steps.length} |
            Campaign Name = "{campaignData.name}" | Objective = {Array.isArray(campaignData.objective) ? campaignData.objective.join(',') : campaignData.objective}
          </div>

          {renderStepContent()}

          {/* MARCUS ADVICE */}
          {marcusAdvice && marcusAdvice.step === currentStep && (
            <div style={{
              marginTop: '20px',
              padding: '15px',
              background: 'rgba(0,255,65,0.2)',
              border: '1px solid #00ff41',
              borderRadius: '8px'
            }}>
              <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>
                🤖 MARCUS ANALYSE:
              </div>
              <div style={{ fontSize: '0.9rem', lineHeight: '1.4' }}>
                {marcusAdvice.advice}
              </div>
            </div>
          )}
        </div>

        {/* FOOTER NAVIGATION */}
        <div style={{
          padding: '20px',
          borderTop: '1px solid #00ff41',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <button
            onClick={prevStep}
            disabled={currentStep === 1}
            style={{
              padding: '10px 20px',
              background: 'transparent',
              border: '1px solid #00ff41',
              color: '#00ff41',
              borderRadius: '5px',
              cursor: currentStep === 1 ? 'not-allowed' : 'pointer',
              opacity: currentStep === 1 ? 0.5 : 1,
              fontFamily: 'Courier New, monospace'
            }}
          >
            ← ZURÜCK
          </button>

          <div style={{
            fontSize: '0.9rem',
            opacity: 0.7
          }}>
            Schritt {currentStep} von {steps.length}
          </div>

          {currentStep === steps.length ? (
            <button
              onClick={createCampaign}
              disabled={isCreating}
              style={{
                padding: '10px 20px',
                background: '#00ff41',
                border: 'none',
                color: '#000',
                borderRadius: '5px',
                cursor: isCreating ? 'not-allowed' : 'pointer',
                fontFamily: 'Courier New, monospace',
                fontWeight: 'bold',
                opacity: isCreating ? 0.5 : 1
              }}
            >
              {isCreating ? '⏳ ERSTELLE...' : '🚀 CAMPAIGN STARTEN'}
            </button>
          ) : (
            <button
              onClick={() => {
                console.log('🚀 WEITER Button clicked!');
                nextStep();
              }}
              style={{
                padding: '10px 20px',
                background: '#00ff41',
                border: 'none',
                color: '#000',
                borderRadius: '5px',
                cursor: 'pointer',
                fontFamily: 'Courier New, monospace',
                fontWeight: 'bold'
              }}
            >
              WEITER → (Step {currentStep}/{steps.length})
            </button>
          )}
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.1); }
          100% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

export default CampaignCreator;