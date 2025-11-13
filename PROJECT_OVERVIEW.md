# TrustPay - Project Overview

## 🎯 What is TrustPay?

TrustPay is a **UPI-based escrow platform** that adds a trust layer to India's digital payments. It allows users to send money that's held securely until conditions are met, with blockchain-backed proof of every transaction.

**Tagline**: "UPI Payments You Can Actually Trust"

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        USER INTERFACE                        │
│                    (React + Tailwind CSS)                    │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      │ REST API
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                     BACKEND API                              │
│                   (FastAPI + Python)                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Auth Service │  │Escrow Service│  │ User Service │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└───────┬──────────────────┬──────────────────┬──────────────┘
        │                  │                  │
        │                  │                  │
┌───────▼────────┐ ┌───────▼────────┐ ┌──────▼───────┐
│   PostgreSQL   │ │  Setu UPI API  │ │   Polygon    │
│   (Database)   │ │  (Payments)    │ │ (Blockchain) │
└────────────────┘ └────────────────┘ └──────────────┘
```

## 📁 Project Structure

```
TrustPay/
│
├── frontend/                    # React Frontend Application
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   │   ├── Aurora/         # WebGL animated background
│   │   │   ├── PixelCard/      # Interactive pixel animations
│   │   │   ├── BubbleMenu/     # Animated navigation
│   │   │   ├── LogoLoop/       # Tech stack showcase
│   │   │   └── Dashboard/      # Dashboard components
│   │   ├── pages/              # Page components
│   │   │   ├── LandingPage.jsx
│   │   │   ├── AppDashboard.jsx
│   │   │   └── NotFound.jsx
│   │   └── data/               # Mock data
│   ├── package.json
│   └── README.md
│
├── backend/                     # FastAPI Backend Application
│   ├── app/
│   │   ├── api/                # API routes
│   │   │   └── v1/
│   │   │       ├── endpoints/  # API endpoints
│   │   │       │   ├── auth.py
│   │   │       │   ├── users.py
│   │   │       │   └── escrows.py
│   │   │       └── api.py
│   │   ├── core/               # Core configuration
│   │   │   ├── config.py       # Settings
│   │   │   ├── database.py     # Database connection
│   │   │   └── security.py     # Authentication
│   │   ├── models/             # Database models
│   │   │   ├── user.py
│   │   │   ├── escrow.py
│   │   │   ├── confirmation.py
│   │   │   ├── dispute.py
│   │   │   └── blockchain_log.py
│   │   ├── schemas/            # Pydantic schemas
│   │   │   ├── auth.py
│   │   │   ├── user.py
│   │   │   └── escrow.py
│   │   └── services/           # Business logic
│   │       ├── escrow_service.py
│   │       ├── setu_service.py
│   │       └── blockchain_service.py
│   ├── main.py                 # Application entry point
│   ├── requirements.txt
│   └── README.md
│
├── docs/                        # Documentation
│   ├── PRD.md                  # Product Requirements
│   └── technicaldoc.md         # Technical Documentation
│
├── README.md                    # Main README
├── SETUP.md                     # Setup instructions
├── PROJECT_OVERVIEW.md          # This file
└── start-dev.bat               # Quick start script (Windows)
```

## 🔄 User Flow

### 1. Create Escrow
```
User A (Payer) → Creates escrow with:
  - Payee UPI VPA
  - Amount
  - Description
  - Conditions
```

### 2. Fund Escrow
```
System → Sends UPI collect request
User A → Approves payment in UPI app
Funds → Held in TrustPay virtual account
Blockchain → Records transaction proof
```

### 3. Delivery/Service
```
User B (Payee) → Delivers goods/service
Both parties → Can track status in dashboard
```

### 4. Confirmation
```
User A → Confirms receipt
User B → Confirms delivery
System → Verifies both confirmations
```

### 5. Release
```
Smart Contract → Triggers release
System → Initiates UPI Pay to User B
Blockchain → Records final state
User B → Receives payment
```

## 🛠️ Technology Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| React 18 | UI framework |
| Vite | Build tool |
| Tailwind CSS | Styling |
| GSAP | Animations |
| OGL | WebGL effects |

### Backend
| Technology | Purpose |
|------------|---------|
| FastAPI | Web framework |
| PostgreSQL | Database |
| SQLAlchemy | ORM |
| Web3.py | Blockchain |
| Setu API | UPI payments |
| JWT | Authentication |

### Infrastructure
| Technology | Purpose |
|------------|---------|
| Polygon | Blockchain network |
| Redis | Caching (optional) |
| Celery | Task queue (optional) |

## 📊 Database Schema

### Users Table
```sql
- id (UUID, PK)
- name (String)
- email (String, Unique)
- vpa (String, Unique)
- hashed_password (String)
- kyc_status (String)
- created_at (DateTime)
```

### Escrows Table
```sql
- id (UUID, PK)
- payer_id (UUID, FK → users)
- payee_vpa (String)
- amount (Integer, in paise)
- status (Enum: INITIATED, HELD, RELEASED, etc.)
- setu_collect_id (String)
- blockchain_tx_hash (String)
- created_at (DateTime)
- expires_at (DateTime)
```

### Confirmations Table
```sql
- id (UUID, PK)
- escrow_id (UUID, FK → escrows)
- user_id (UUID, FK → users)
- role (String: payer/payee)
- confirmed_at (DateTime)
```

### Disputes Table
```sql
- id (UUID, PK)
- escrow_id (UUID, FK → escrows)
- raised_by (UUID, FK → users)
- reason (Text)
- status (String)
- resolved_at (DateTime)
```

## 🔐 Security Features

1. **JWT Authentication**: Secure token-based auth
2. **Password Hashing**: bcrypt for password storage
3. **Input Validation**: Pydantic schemas
4. **CORS Protection**: Configured origins
5. **Blockchain Proof**: Immutable transaction records
6. **Bank-grade Custody**: Funds in regulated accounts

## 🚀 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register user
- `POST /api/v1/auth/login` - Login

### Users
- `GET /api/v1/users/me` - Get current user
- `PUT /api/v1/users/me` - Update profile

### Escrows
- `POST /api/v1/escrows/create` - Create escrow
- `GET /api/v1/escrows/{id}` - Get escrow details
- `GET /api/v1/escrows/` - List user escrows
- `POST /api/v1/escrows/{id}/confirm` - Confirm escrow
- `POST /api/v1/escrows/{id}/dispute` - Raise dispute

## 💰 Business Model

### Revenue Streams
1. **Transaction Fees**: 1-2% per escrow
2. **Premium Tier**: Enhanced features + insurance
3. **B2B API**: Subscription for platforms
4. **Dispute Resolution**: Arbitration fees

### Target Market
- **Freelancers**: 10M+ in India
- **Small Merchants**: 60M+ MSMEs
- **Marketplaces**: 1000+ platforms
- **NGOs**: 3M+ organizations

## 📈 Success Metrics

### 12-Month Targets
- **100,000** transactions processed
- **₹10 crore/month** GMV
- **20%** conversion rate
- **<1%** dispute rate
- **40+** NPS score
- **₹5 lakh/month** revenue

## 🎯 Roadmap

### MVP (v0.1) ✅
- Core escrow flow
- UPI integration
- Blockchain proof
- User dashboard

### v0.2 (Next)
- Webhook integrations
- Auto-release timeouts
- Dispute resolution UI
- Email notifications

### v0.3 (Future)
- B2B API & SDK
- Advanced analytics
- Insurance integration
- Mobile app

### v1.0 (Long-term)
- Merchant plugins
- AI fraud detection
- Multi-currency support
- International expansion

## 🔧 Development Setup

### Quick Start
```bash
# Clone repository
git clone <repo-url>
cd TrustPay

# Start both servers (Windows)
start-dev.bat

# Or manually:
# Terminal 1 - Backend
cd backend
pip install -r requirements.txt
python main.py

# Terminal 2 - Frontend
cd frontend
npm install
npm run dev
```

### Access Points
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

## 📚 Documentation

- **[README.md](README.md)** - Project introduction
- **[SETUP.md](SETUP.md)** - Detailed setup guide
- **[docs/PRD.md](docs/PRD.md)** - Product requirements
- **[docs/technicaldoc.md](docs/technicaldoc.md)** - Technical specs
- **[frontend/README.md](frontend/README.md)** - Frontend docs
- **[backend/README.md](backend/README.md)** - Backend docs

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Test thoroughly
5. Submit pull request

## 📞 Contact

- **Email**: support@trustpay.in
- **Location**: Mumbai, India

---

**TrustPay** - Building the trust layer for India's digital payments 🇮🇳
