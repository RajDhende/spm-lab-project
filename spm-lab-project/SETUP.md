# Setup Guide - AI-Driven Ticket Automation System

Complete setup instructions for the Ticket Automation System.

## Prerequisites

- **Node.js** (v18 or higher)
- **MongoDB** (local installation or MongoDB Atlas)
- **Python** (3.8 or higher)
- **pnpm** (package manager)

## Step-by-Step Setup

### 1. Clone and Navigate

```bash
cd spm-lab-project
```

### 2. Backend Setup

```bash
cd backend
pnpm install
```

Create `.env` file:
```bash
cp .env.example .env
```

Edit `.env` and set:
- `MONGODB_URI` - Your MongoDB connection string
- `JWT_SECRET` - A secure random string
- `AI_SERVICE_URL` - http://localhost:8000 (default)
- `CORS_ORIGIN` - http://localhost:5173 (default)

Start backend:
```bash
pnpm run dev
```

Backend runs on `http://localhost:5000`

### 3. AI Service Setup

Open a new terminal:

```bash
cd ai-service
pip install -r requirements.txt
```

Start AI service:
```bash
python app.py
```

AI service runs on `http://localhost:8000`

### 4. Frontend Setup

Open a new terminal (from project root):

```bash
pnpm install
```

Create `.env` file:
```env
VITE_API_URL=http://localhost:5000/api
```

Start frontend:
```bash
pnpm run dev
```

Frontend runs on `http://localhost:5173`

## Initial Setup - Create Admin User

1. Start MongoDB
2. Start backend server
3. Register a user via API or frontend
4. Manually update user role to 'admin' in MongoDB:

```javascript
// In MongoDB shell or Compass
db.users.updateOne(
  { email: "your-email@example.com" },
  { $set: { role: "admin" } }
)
```

## Testing the System

1. **Register a User**: Visit `http://localhost:5173/register`
2. **Login**: Visit `http://localhost:5173/login`
3. **Create a Ticket**: As a user, create a ticket
4. **View Dashboard**: Check ticket statistics
5. **Admin Dashboard**: Login as admin to view analytics

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running
- Check `MONGODB_URI` in `.env`
- For MongoDB Atlas, ensure IP is whitelisted

### AI Service Not Responding
- Check Python version: `python --version`
- Install dependencies: `pip install -r requirements.txt`
- Check if port 8000 is available

### CORS Errors
- Ensure `CORS_ORIGIN` in backend `.env` matches frontend URL
- Check backend is running on port 5000

### Frontend API Errors
- Check `VITE_API_URL` in frontend `.env`
- Ensure backend is running
- Check browser console for errors

## Development Workflow

1. Start MongoDB (if local)
2. Start backend: `cd backend && pnpm run dev`
3. Start AI service: `cd ai-service && python app.py`
4. Start frontend: `pnpm run dev`

All services should now be running and communicating.

## Production Deployment

### Environment Variables

Set all environment variables in production:
- Backend: MongoDB URI, JWT secret, CORS origin
- Frontend: API URL
- AI Service: Model paths

### Build Frontend

```bash
pnpm run build
```

### Docker (Optional)

Docker configurations can be added for containerized deployment.

## Support

For issues or questions, refer to the main README.md file.

