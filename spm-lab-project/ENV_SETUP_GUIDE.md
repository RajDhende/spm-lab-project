# Environment Variables Setup Guide

This guide explains all the environment variables needed for the Ticket Automation System.

## 📁 Required .env Files

You need to create **2** `.env` files:

1. **`backend/.env`** - Backend server configuration
2. **`.env`** (root) - Frontend configuration

---

## 🔧 Backend Configuration (`backend/.env`)

### 1. **PORT** (Required)
```env
PORT=5000
```
- **What it is**: Port number where the backend server runs
- **Default**: `5000`
- **Change if**: You need to use a different port (e.g., if 5000 is occupied)

### 2. **NODE_ENV** (Required)
```env
NODE_ENV=development
```
- **What it is**: Environment mode (development, production, or test)
- **Options**: `development`, `production`, `test`
- **Change if**: Deploying to production (set to `production`)

### 3. **MONGODB_URI** (Required)
```env
MONGODB_URI=mongodb://localhost:27017/ticket-automation
```
- **What it is**: MongoDB database connection string
- **Local MongoDB**: `mongodb://localhost:27017/ticket-automation`
- **MongoDB Atlas (Cloud)**: `mongodb+srv://username:password@cluster.mongodb.net/ticket-automation?retryWrites=true&w=majority`
- **How to get**: 
  - Local: Install MongoDB locally, use the default connection string
  - Atlas: Create account at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas), get connection string
- **⚠️ Important**: Replace `username` and `password` with your actual credentials

### 4. **JWT_SECRET** (Required)
```env
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-123456789
```
- **What it is**: Secret key for signing JWT tokens (used for authentication)
- **How to generate**:
  ```bash
  # Using Node.js
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  
  # Or use an online generator
  # Visit: https://randomkeygen.com/
  ```
- **⚠️ CRITICAL**: 
  - Use a **strong, random string** (at least 32 characters)
  - **Never commit** this to version control
  - Use different secrets for development and production

### 5. **JWT_EXPIRE** (Optional)
```env
JWT_EXPIRE=7d
```
- **What it is**: How long JWT tokens remain valid
- **Format**: `7d` (7 days), `24h` (24 hours), `1h` (1 hour), `30m` (30 minutes)
- **Default**: `7d`
- **Change if**: You want shorter/longer session times

### 6. **AI_SERVICE_URL** (Required)
```env
AI_SERVICE_URL=http://localhost:8000
```
- **What it is**: URL of the Python AI microservice
- **Local**: `http://localhost:8000` (default)
- **Remote**: `https://your-ai-service.com`
- **Change if**: AI service runs on a different port or remote server

### 7. **CORS_ORIGIN** (Required)
```env
CORS_ORIGIN=http://localhost:5173
```
- **What it is**: Frontend URL allowed to access the backend (CORS)
- **Development**: `http://localhost:5173` (Vite default port)
- **Production**: `https://yourdomain.com`
- **Change if**: Frontend runs on a different port or domain

---

## 🎨 Frontend Configuration (`.env` in root)

### 1. **VITE_API_URL** (Required)
```env
VITE_API_URL=http://localhost:5000/api
```
- **What it is**: Backend API URL for frontend to make requests
- **Development**: `http://localhost:5000/api`
- **Production**: `https://api.yourdomain.com/api`
- **⚠️ Note**: Must start with `VITE_` prefix for Vite to expose it
- **Change if**: Backend runs on different port or remote server

---

## 🚀 Quick Setup Steps

### Step 1: Create Backend .env
```bash
cd backend
cp .env.example .env
# Edit .env with your values
```

### Step 2: Create Frontend .env
```bash
# From project root
cp .env.example .env
# Edit .env with your values
```

### Step 3: Update Values

**For Local Development:**

**backend/.env:**
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/ticket-automation
JWT_SECRET=generate-a-random-secret-here
JWT_EXPIRE=7d
AI_SERVICE_URL=http://localhost:8000
CORS_ORIGIN=http://localhost:5173
```

**.env (root):**
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 🔐 Security Best Practices

1. **Never commit `.env` files** to Git (already in `.gitignore`)
2. **Use strong JWT secrets** (at least 32 random characters)
3. **Use different secrets** for development and production
4. **Protect MongoDB credentials** - don't share connection strings
5. **Use environment-specific values** for production deployments

---

## 🐛 Troubleshooting

### Backend won't start
- ✅ Check MongoDB is running: `mongod --version`
- ✅ Verify `MONGODB_URI` is correct
- ✅ Check if port 5000 is available: `netstat -ano | findstr :5000`

### Frontend can't connect to backend
- ✅ Verify `VITE_API_URL` matches backend URL
- ✅ Check backend is running: `curl http://localhost:5000/api/health`
- ✅ Verify CORS_ORIGIN in backend matches frontend URL

### AI Service not responding
- ✅ Check AI service is running: `curl http://localhost:8000/health`
- ✅ Verify `AI_SERVICE_URL` in backend matches AI service URL

---

## 📝 Example .env Files

### Minimal Setup (Local Development)

**backend/.env:**
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/ticket-automation
JWT_SECRET=dev-secret-key-change-in-production-abc123xyz
JWT_EXPIRE=7d
AI_SERVICE_URL=http://localhost:8000
CORS_ORIGIN=http://localhost:5173
```

**.env (root):**
```env
VITE_API_URL=http://localhost:5000/api
```

### Production Setup

**backend/.env:**
```env
PORT=5000
NODE_ENV=production
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/ticket-automation?retryWrites=true&w=majority
JWT_SECRET=<strong-random-production-secret>
JWT_EXPIRE=24h
AI_SERVICE_URL=https://ai-service.yourdomain.com
CORS_ORIGIN=https://yourdomain.com
```

**.env (root):**
```env
VITE_API_URL=https://api.yourdomain.com/api
```

---

## ✅ Verification

After setting up, verify:

1. **Backend**: `curl http://localhost:5000/api/health`
2. **AI Service**: `curl http://localhost:8000/health`
3. **Frontend**: Open `http://localhost:5173` in browser

All services should respond successfully!

