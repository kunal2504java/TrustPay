# TrustPay Backend

FastAPI-based backend for TrustPay UPI Escrow Platform.

## Features

- **Escrow Management**: Create, track, and manage UPI escrow transactions
- **Blockchain Integration**: Immutable proof-of-transaction on Polygon
- **UPI Gateway**: Integration with Setu for UPI collect/pay operations
- **User Authentication**: JWT-based authentication system
- **Dispute Resolution**: Built-in dispute management system

## Tech Stack

- **Framework**: FastAPI (Python 3.9+)
- **Database**: PostgreSQL with SQLAlchemy ORM (async)
- **Blockchain**: Web3.py for Polygon integration
- **UPI Gateway**: Setu API integration
- **Authentication**: JWT with passlib
- **Task Queue**: Celery with Redis

## Setup

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env with your configuration
```

### 3. Setup Database

```bash
# Create PostgreSQL database
createdb trustpay

# Tables will be created automatically on first run
```

### 4. Run Development Server

```bash
python main.py
```

The API will be available at `http://localhost:8000`

API documentation: `http://localhost:8000/docs`

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login and get access token

### Users
- `GET /api/v1/users/me` - Get current user info
- `PUT /api/v1/users/me` - Update user profile

### Escrows
- `POST /api/v1/escrows/create` - Create new escrow
- `GET /api/v1/escrows/{escrow_id}` - Get escrow details
- `GET /api/v1/escrows/` - List user's escrows
- `POST /api/v1/escrows/{escrow_id}/confirm` - Confirm escrow
- `POST /api/v1/escrows/{escrow_id}/dispute` - Raise dispute

## Project Structure

```
backend/
├── app/
│   ├── api/
│   │   └── v1/
│   │       ├── endpoints/
│   │       │   ├── auth.py
│   │       │   ├── users.py
│   │       │   └── escrows.py
│   │       └── api.py
│   ├── core/
│   │   ├── config.py
│   │   ├── database.py
│   │   └── security.py
│   ├── models/
│   │   ├── user.py
│   │   ├── escrow.py
│   │   ├── confirmation.py
│   │   ├── dispute.py
│   │   └── blockchain_log.py
│   ├── schemas/
│   │   ├── auth.py
│   │   ├── user.py
│   │   └── escrow.py
│   └── services/
│       ├── escrow_service.py
│       ├── setu_service.py
│       └── blockchain_service.py
├── main.py
├── requirements.txt
└── .env.example
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `SECRET_KEY` | JWT secret key (min 32 chars) | Yes |
| `SETU_API_KEY` | Setu API key for UPI operations | No (for dev) |
| `POLYGON_RPC_URL` | Polygon RPC endpoint | No (for dev) |
| `PRIVATE_KEY` | Ethereum private key for blockchain | No (for dev) |
| `REDIS_URL` | Redis connection string | No (for dev) |

## Development

### Running Tests

```bash
pytest
```

### Code Formatting

```bash
black app/
```

## Deployment

For production deployment, ensure:
- Use strong `SECRET_KEY` (min 32 characters)
- Configure proper database with connection pooling
- Set up Redis for caching
- Configure Setu API credentials
- Set up blockchain wallet and contract
- Enable HTTPS
- Implement rate limiting
- Set up monitoring and logging

## License

MIT License
