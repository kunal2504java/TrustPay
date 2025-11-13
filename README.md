# TrustPay - UPI Escrow Platform

**"UPI Payments You Can Actually Trust"**

TrustPay is a comprehensive UPI-based escrow platform that provides a trust layer for digital payments in India. Built with React frontend and FastAPI backend, integrated with blockchain for immutable transaction proofs.

## 🚀 Features

### Frontend
- **Modern UI/UX**: Built with React, Tailwind CSS, and GSAP animations
- **Aurora Background**: WebGL-powered animated gradient effects
- **Pixel Cards**: Interactive canvas-based animations for user personas
- **Bubble Menu**: Animated navigation with glassmorphism design
- **Logo Loop**: Infinite scrolling tech stack showcase
- **Responsive Design**: Mobile-first approach with dark theme
- **Dashboard**: Comprehensive escrow management interface

### Backend
- **Escrow Management**: Create, track, and manage UPI escrow transactions
- **Blockchain Integration**: Immutable proof-of-transaction on Polygon
- **UPI Gateway**: Integration with Setu for UPI collect/pay operations
- **User Authentication**: JWT-based secure authentication
- **Dispute Resolution**: Built-in dispute management system
- **Real-time Updates**: WebSocket support for live updates

## 🏗️ Project Structure

```
TrustPay/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/           # Page components
│   │   └── data/            # Mock data and constants
│   ├── package.json
│   └── README.md
├── backend/                 # FastAPI backend application
│   ├── app/
│   │   ├── api/            # API routes and endpoints
│   │   ├── core/           # Core configuration and database
│   │   ├── models/         # SQLAlchemy database models
│   │   ├── schemas/        # Pydantic schemas
│   │   └── services/       # Business logic services
│   ├── main.py
│   ├── requirements.txt
│   └── README.md
├── docs/                   # Project documentation
│   ├── PRD.md             # Product Requirements Document
│   └── technicaldoc.md    # Technical Documentation
├── README.md              # Main project documentation
├── SETUP.md               # Setup instructions
├── PROJECT_OVERVIEW.md    # Architecture overview
└── start-dev.bat          # Quick start script (Windows)
```

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **GSAP** - Animations
- **OGL** - WebGL effects

### Backend
- **FastAPI** - Python web framework
- **PostgreSQL** - Database
- **SQLAlchemy** - ORM
- **Web3.py** - Blockchain integration
- **Setu API** - UPI gateway
- **Redis** - Caching

### Blockchain
- **Polygon** - Layer 2 scaling
- **Solidity** - Smart contracts

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.9+
- PostgreSQL 13+
- Redis 6+ (optional for dev)

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:3000`

### Backend Setup

```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your configuration
python main.py
```

Backend API runs at `http://localhost:8000`

API docs at `http://localhost:8000/docs`

## 📱 User Personas

1. **Freelancer** - Needs payment assurance before work delivery
2. **Small Merchant** - Wants to accept pre-orders safely
3. **Platform Owner** - Marketplace seeking escrow integration
4. **NGO Finance Lead** - Requires verifiable transaction receipts

## 🔄 User Flow

1. **Create Escrow** - Payer initiates escrow with payee details
2. **Fund Escrow** - UPI collect request sent to payer
3. **Hold Funds** - Money held in virtual account, proof on blockchain
4. **Confirm Delivery** - Both parties confirm completion
5. **Release Funds** - Automatic release to payee via UPI

## 🔐 Security Features

- **Blockchain Proof** - Immutable transaction records on Polygon
- **Bank-grade Security** - Funds held in regulated virtual accounts
- **JWT Authentication** - Secure user sessions
- **Input Validation** - Comprehensive data sanitization
- **Rate Limiting** - API abuse prevention

## 📊 Business Model

- **Transaction Fee**: 1-2% per escrow transaction
- **Premium Tier**: Enhanced features with insurance
- **B2B API**: Subscription model for platforms
- **Dispute Resolution**: Small arbitration fees

## 🎯 Success Metrics (12 months)

- **100,000** escrow transactions processed
- **₹10 crore/month** GMV through platform
- **20%** conversion rate for initiated escrows
- **<1%** dispute rate
- **40+** NPS score among users
- **₹5 lakh/month** revenue from fees

## 🚀 Roadmap

### MVP (v0.1) ✅
- Core escrow flow with UPI integration
- Blockchain proof-of-transaction
- User dashboard and management

### v0.2 🔄
- Webhook integrations
- Auto-release timeouts
- Dispute resolution UI

### v0.3 📋
- B2B API and SDK
- Advanced analytics
- Insurance integration

### v1.0 📋
- Mobile SDKs
- Merchant plugins (Shopify, WooCommerce)
- AI fraud detection

## 📄 Documentation

- [Product Requirements Document](docs/PRD.md)
- [Technical Documentation](docs/technicaldoc.md)
- [Frontend README](frontend/README.md)
- [Backend README](backend/README.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License

## 📞 Contact

- **Email**: support@trustpay.in
- **Phone**: +91 98765 43210
- **Location**: Mumbai, Maharashtra, India

---

**TrustPay** - Building the trust layer for India's digital payments 🇮🇳
