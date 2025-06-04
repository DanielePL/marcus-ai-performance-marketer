# 🤖 Marcus - AI Performance Marketer

Marcus ist eine hochanalytische Ads Campaign Engine, die durch Google und Meta APIs den jeweiligen Zielmarkt perfekt analysiert und anhand von Trends und Statistiken die jeweils beste Ads-Kampagne erstellt, schaltet, verwaltet und analysiert.

## ✨ Features

- **🧠 AI-Powered Marketing**: OpenAI-Integration für intelligente Kampagnenstrategien
- **📊 Real-time Performance**: Live-Monitoring und Auto-Optimierung
- **🎯 Multi-Platform**: Google Ads, Meta Ads, TikTok Ads Support
- **⚡ Auto-Optimization**: KI-gestützte Budget- und Bid-Optimierung
- **📈 Live Analytics**: Real-time ROAS, CTR, CPC Tracking
- **🔔 Smart Alerts**: Automatische Performance-Benachrichtigungen
- **💬 AI Consultant**: Marcus Chat-Interface für Marketing-Beratung

## 🚀 Quick Start

```bash
# 1. Repository klonen
git clone https://github.com/your-org/marcus-ai-performance-marketer.git
cd marcus-ai-performance-marketer

# 2. Dependencies installieren
npm run install:all

# 3. Environment Variables setzen
cp .env.example .env
# -> .env bearbeiten und API Keys hinzufügen

# 4. Database seeden
npm run db:seed

# 5. Development starten
npm run dev
```

## 📋 Requirements

- **Node.js**: >= 18.0.0
- **MongoDB**: >= 5.0 (lokal oder Atlas)
- **OpenAI API Key**: Erforderlich für AI-Features
- **Google Ads API**: Optional für Live-Performance
- **Meta API**: Optional für Multi-Platform

## 🛠️ Development

```bash
# Komplette Entwicklungsumgebung starten
npm run dev

# Nur Server starten
npm run dev:server-only

# Nur Client starten
npm run dev:client-only

# Tests ausführen
npm test

# AI API testen
npm run marcus:test-ai

# Health Check
npm run marcus:analytics
```

## 📚 Architecture

```
marcus-ai-performance-marketer/
├── client/          # React Frontend (Vite)
├── server/          # Node.js Backend (Express)
├── shared/          # Geteilte Utilities
├── database/        # MongoDB Schemas & Seeds
├── docs/           # Dokumentation
└── deployment/     # Docker & K8s
```

## 🤖 Marcus AI Features

### AI Consultant
- Performance-Analyse und Optimierungsvorschläge
- Budget-Allocation Empfehlungen
- Creative Testing Strategien
- Real-time Q&A Support

### Auto-Optimization
- ROAS-basierte Budget-Anpassungen
- Automatic Bid Management
- Performance Alert System
- Campaign Pause/Resume Logic

### Live Monitoring
- Real-time Metriken alle 15 Minuten
- WebSocket Live-Updates
- Dashboard mit Live-Charts
- Alert Notifications

## 📊 APIs & Integrations

| Platform | Status | Features |
|----------|--------|----------|
| OpenAI | ✅ Required | AI Consultant, Strategy Generation |
| Google Ads | ⚡ Optional | Campaign Management, Performance Data |
| Meta Ads | ⚡ Optional | Multi-Platform Campaigns |
| TikTok Ads | 🔄 Coming Soon | Emerging Platform Support |

## 🔧 Configuration

### Environment Variables
Siehe `.env.example` für alle verfügbaren Konfigurationen.

### API Setup
1. **OpenAI**: Erstelle API Key auf [platform.openai.com](https://platform.openai.com)
2. **Google Ads**: Setup über [Google Ads API Console](https://developers.google.com/google-ads/api)
3. **Meta**: App erstellen im [Meta Developer Portal](https://developers.facebook.com)

## 📈 Performance

Marcus ist optimiert für:
- **Sub-second Response Times**
- **Real-time Data Processing**
- **Horizontal Scaling**
- **High Availability**

## 🧪 Testing

```bash
# Unit Tests
npm run test:server
npm run test:client

# Integration Tests
npm run test:integration

# E2E Tests
npm run test:e2e

# AI API Test
npm run marcus:test-ai
```

## 🚢 Deployment

### Docker
```bash
npm run docker:build
npm run docker:up
```

### Production
```bash
npm run build
npm run start:prod
```

## 📖 Documentation

- [API Documentation](docs/API.md)
- [Setup Guide](docs/SETUP.md)
- [Deployment Guide](docs/DEPLOYMENT.md)
- [Marcus AI Features](docs/MARCUS_AI.md)

## 🤝 Contributing

1. Fork das Repository
2. Erstelle Feature Branch (`git checkout -b feature/amazing-feature`)
3. Commit Changes (`git commit -m 'Add amazing feature'`)
4. Push to Branch (`git push origin feature/amazing-feature`)
5. Erstelle Pull Request

## 📄 License

MIT License - siehe [LICENSE](LICENSE) file.

## 🎯 Roadmap

- [ ] TikTok Ads Integration
- [ ] LinkedIn Ads Support
- [ ] Advanced AI Personas
- [ ] Multi-Language Support
- [ ] White-Label Solutions

---

**Marcus AI Performance Marketer** - Wo Künstliche Intelligenz auf Performance Marketing trifft. 🚀
