# AI-Driven Ticket Automation System

A complete MERN stack application with Python ML microservice for automated ticket management and classification.

## Tech Stack

- **Frontend**: React + Vite + Material UI + Redux Toolkit
- **Backend**: Node.js + Express + MongoDB
- **AI Service**: Python Flask + scikit-learn
- **Database**: MongoDB

## Project Structure

```
spm-lab-project/
├── backend/              # Node.js Express backend
│   ├── src/
│   │   ├── controllers/ # Route controllers
│   │   ├── models/      # MongoDB models
│   │   ├── routes/      # API routes
│   │   ├── middleware/  # Auth & audit middleware
│   │   ├── services/    # Business logic services
│   │   └── server.js    # Entry point
│   └── package.json
├── ai-service/          # Python Flask AI microservice
│   ├── app.py          # Flask application
│   └── requirements.txt
└── src/                 # React frontend
    ├── components/      # Reusable components
    ├── pages/           # Page components
    ├── services/        # API services
    ├── store/           # Redux store
    └── App.jsx
```

## Features

### User Management
- JWT-based authentication
- Role-based access control (User, Agent, Admin)
- User registration and login

### Ticket Management
- Create tickets with AI auto-classification
- View and manage tickets based on role
- Status tracking (Open → In Progress → Resolved → Closed)
- Comments and updates

### AI Engine
- Automatic category prediction (Password Reset, Access Provisioning, etc.)
- Priority automation (High/Medium/Low)
- Confidence scoring
- Continuous learning from escalations

### Workflow Automation
- Auto-resolve password reset tickets
- Auto-provision access
- Auto-retrieve logs
- Auto-escalation for out-of-scope tickets

### Admin Dashboard
- Real-time KPIs and metrics
- Ticket trends and analytics
- Agent productivity tracking
- AI model accuracy metrics

## Setup Instructions

### Prerequisites
- Node.js (v18+)
- MongoDB (local or Atlas)
- Python 3.8+
- pnpm (package manager)

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
pnpm install
```

3. Create `.env` file (copy from `.env.example`):
```bash
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ticket-automation
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d
AI_SERVICE_URL=http://localhost:8000
CORS_ORIGIN=http://localhost:5173
```

4. Start the backend server:
```bash
pnpm run dev
```

### AI Service Setup

1. Navigate to ai-service directory:
```bash
cd ai-service
```

2. Install Python dependencies:
```bash
pip install -r requirements.txt
```

3. Start the AI service:
```bash
python app.py
```

### Frontend Setup

1. Install dependencies (from root):
```bash
pnpm install
```

2. Create `.env` file:
```env
VITE_API_URL=http://localhost:5000/api
```

3. Start the development server:
```bash
pnpm run dev
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Tickets
- `POST /api/tickets` - Create ticket
- `GET /api/tickets` - Get all tickets (role-based)
- `GET /api/tickets/:id` - Get ticket by ID
- `PUT /api/tickets/:id` - Update ticket
- `POST /api/tickets/:id/comments` - Add comment
- `POST /api/tickets/:id/escalate` - Escalate ticket
- `DELETE /api/tickets/:id` - Delete ticket (admin only)

### AI Service
- `POST /api/ai/predict` - Predict ticket category/priority
- `POST /api/ai/train` - Train model (admin only)
- `PUT /api/ai/update` - Update model (admin only)
- `GET /api/ai/stats` - Get AI model statistics

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics (admin only)

## User Roles

### User
- Create tickets
- View own tickets
- Add comments

### Agent (L1/L2)
- View assigned tickets
- Update ticket status
- Escalate tickets
- Add resolution notes

### Admin
- All agent permissions
- View all tickets
- Access admin dashboard
- Manage users
- Train AI models

## Testing

### Backend Tests
```bash
cd backend
pnpm test
```

## Deployment

### Environment Variables

Ensure all environment variables are set:
- Backend: MongoDB URI, JWT secret, AI service URL
- Frontend: API URL
- AI Service: Model paths

### Docker (Optional)

Docker configurations can be added for containerized deployment.

## Success Metrics

- ✅ ≥ 90% AI Classification Accuracy
- ✅ ≥ 40% Automated Ticket Resolution
- ✅ ≤ 5s Dashboard Response Time
- ✅ Support load reduced by ≥ 30%

## License

MIT
