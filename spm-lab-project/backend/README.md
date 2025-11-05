# Backend API - Ticket Automation System

Node.js + Express backend for the AI-Driven Ticket Automation System.

## Setup

1. Install dependencies:
```bash
pnpm install
```

2. Create `.env` file from `.env.example`:
```bash
cp .env.example .env
```

3. Update `.env` with your configuration:
- Set `MONGODB_URI` to your MongoDB connection string
- Set `JWT_SECRET` to a secure random string
- Configure `AI_SERVICE_URL` if AI service is running on different port

4. Start the server:
```bash
pnpm run dev
```

The server will run on `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

### Tickets
- `POST /api/tickets` - Create ticket (protected)
- `GET /api/tickets` - Get all tickets (protected, role-based)
- `GET /api/tickets/:id` - Get ticket by ID (protected)
- `PUT /api/tickets/:id` - Update ticket (protected)
- `POST /api/tickets/:id/comments` - Add comment (protected)
- `POST /api/tickets/:id/escalate` - Escalate ticket (protected)
- `DELETE /api/tickets/:id` - Delete ticket (admin only)

### AI Service
- `POST /api/ai/predict` - Predict ticket category/priority (protected)
- `POST /api/ai/train` - Train model (admin only)
- `PUT /api/ai/update` - Update model (admin only)
- `GET /api/ai/stats` - Get AI model statistics (protected)

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics (admin only)

## Testing

Run tests:
```bash
pnpm test
```

## Project Structure

```
backend/
├── src/
│   ├── config/         # Database configuration
│   ├── controllers/    # Route controllers
│   ├── middleware/     # Auth & audit middleware
│   ├── models/         # MongoDB models
│   ├── routes/         # API routes
│   ├── services/       # Business logic services
│   ├── utils/          # Utility functions
│   └── server.js       # Entry point
├── tests/              # Test files
└── package.json
```

