# TrustPay - Changelog

## [Unreleased] - 2024-11-13

### Project Reorganization ✅

#### Added
- **Backend Structure**: Complete FastAPI backend with:
  - User authentication (JWT-based)
  - Escrow management system
  - Database models (User, Escrow, Confirmation, Dispute, BlockchainLog)
  - API endpoints for auth, users, and escrows
  - Service layer (EscrowService, SetuService, BlockchainService)
  - PostgreSQL integration with SQLAlchemy
  - Blockchain integration with Web3.py
  - UPI gateway integration (Setu API)

- **Documentation**:
  - README.md - Main project overview
  - SETUP.md - Detailed setup instructions
  - PROJECT_OVERVIEW.md - Architecture and technical details
  - QUICK_START.md - Quick reference guide
  - frontend/README.md - Frontend-specific documentation
  - backend/README.md - Backend-specific documentation
  - CHANGELOG.md - This file

- **Development Tools**:
  - start-dev.bat - Quick start script for Windows
  - .gitignore - Updated for monorepo structure
  - backend/.gitignore - Backend-specific ignores
  - backend/.env.example - Environment configuration template

#### Changed
- **Project Structure**: Reorganized into monorepo structure
  - Moved all frontend code to `/frontend` folder
  - Created `/backend` folder with complete API structure
  - Moved documentation to `/docs` folder
  - Cleaned up root directory

#### Removed
- Duplicate files from root directory:
  - src/ folder (moved to frontend/src/)
  - node_modules/ (now in frontend/)
  - package.json, package-lock.json (moved to frontend/)
  - index.html (moved to frontend/)
  - vite.config.js, tailwind.config.js, postcss.config.js (moved to frontend/)
  - PRD.md, technicaldoc.md (moved to docs/)

### Frontend (Existing) ✅

#### Features
- Landing page with Aurora WebGL background
- PixelCard components with canvas animations
- BubbleMenu navigation with GSAP animations
- LogoLoop for tech stack showcase
- Dashboard with escrow management UI
- Responsive design with Tailwind CSS
- Dark theme with glassmorphism effects

### Backend (New) ✅

#### API Endpoints

**Authentication**
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login and get JWT token

**Users**
- `GET /api/v1/users/me` - Get current user profile
- `PUT /api/v1/users/me` - Update user profile

**Escrows**
- `POST /api/v1/escrows/create` - Create new escrow transaction
- `GET /api/v1/escrows/{escrow_id}` - Get escrow details
- `GET /api/v1/escrows/` - List user's escrows
- `POST /api/v1/escrows/{escrow_id}/confirm` - Confirm escrow completion
- `POST /api/v1/escrows/{escrow_id}/dispute` - Raise dispute

#### Database Schema
- **users**: User accounts with KYC status
- **escrows**: Escrow transactions with status tracking
- **confirmations**: Dual confirmation records
- **disputes**: Dispute management
- **blockchain_logs**: Blockchain transaction logs

#### Services
- **EscrowService**: Business logic for escrow operations
- **SetuService**: UPI payment gateway integration
- **BlockchainService**: Polygon blockchain integration

### Technical Stack

#### Frontend
- React 18.2.0
- Vite 5.0.8
- Tailwind CSS 3.4.0
- GSAP 3.12.5
- OGL 1.0.6

#### Backend
- FastAPI 0.104.1
- SQLAlchemy 2.0.23 (async)
- PostgreSQL (asyncpg)
- Web3.py 6.12.0
- Python-Jose 3.3.0 (JWT)
- Passlib 1.7.4 (bcrypt)

### Next Steps

#### v0.2 (Planned)
- [ ] Webhook integrations for external triggers
- [ ] Auto-release timeouts with Chainlink Keepers
- [ ] Dispute resolution UI in dashboard
- [ ] Email notifications
- [ ] SMS notifications via Twilio

#### v0.3 (Planned)
- [ ] B2B API and SDK
- [ ] Advanced analytics dashboard
- [ ] Insurance integration
- [ ] Reconciliation exports

#### v1.0 (Planned)
- [ ] Mobile SDKs (React Native)
- [ ] Merchant plugins (Shopify, WooCommerce)
- [ ] AI-based fraud detection
- [ ] Multi-currency support

### Known Issues
- Setu API integration requires credentials (mock implementation for dev)
- Blockchain integration requires Polygon RPC and private key (optional for dev)
- Redis integration is optional for development

### Development Notes
- Backend uses async/await for all database operations
- Frontend uses mock data for escrows (src/data/mockEscrows.js)
- CORS is configured for localhost:3000 and localhost:5173
- JWT tokens expire after 30 minutes (configurable)

---

## Version History

### [0.1.0] - 2024-11-13
- Initial project reorganization
- Complete backend foundation
- Frontend migration to monorepo structure
- Comprehensive documentation
