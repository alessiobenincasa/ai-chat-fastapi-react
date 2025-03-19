# 🤖 AI Chat Application

<div align="center">

![FastAPI](https://img.shields.io/badge/FastAPI-0.109.2-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React-18.2.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-3.45.0-003B57?style=for-the-badge&logo=sqlite&logoColor=white)

</div>

## 🌟 Features

- 🔐 **Secure Authentication** with JWT tokens
- 🤖 **Interactive Chat** with AI responses
- 📱 **Modern UI** with Material-UI components
- 📊 **Message History** stored in SQLite database
- 🔄 **Real-time Updates** with automatic scrolling
- 🎨 **Beautiful Design** with gradients and animations

## 🛠️ Tech Stack

### Backend
- **FastAPI**: Modern, fast web framework for building APIs
- **SQLAlchemy**: SQL toolkit and ORM
- **JWT**: JSON Web Tokens for authentication
- **SQLite**: Lightweight database for storing users and messages

### Frontend
- **React**: UI library for building user interfaces
- **TypeScript**: Typed JavaScript for better development experience
- **Material-UI**: React components following Material Design
- **Axios**: HTTP client for API requests
- **React Router**: Navigation and routing

## 🚀 Quick Start

### Backend Setup
```bash
# Install dependencies
pip install -r requirements.txt

# Start the server
uvicorn main:app --reload
```

### Frontend Setup
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

## 🔍 Testing Endpoints

### 1. Register a New User
```bash
curl -X POST "http://localhost:8000/register" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@gmail.com",
    "password": "TestPass123!"
  }'
```

### 2. Login (Get Token)
```bash
curl -X POST "http://localhost:8000/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=testuser&password=TestPass123!"
```

### 3. Send Message
```bash
curl -X POST "http://localhost:8000/chat" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"content": "Hello AI!"}'
```

### 4. Get Message History
```bash
curl -X GET "http://localhost:8000/messages" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 🔒 Security Requirements

### Username
- 3-50 characters
- Letters, numbers, underscores, hyphens only
- Must be unique

### Password
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character (@$!%*?&)

### Email
- Valid format
- Allowed domains: gmail.com, yahoo.com, hotmail.com, outlook.com
- Must be unique

## 🧪 Debug Checklist

### Database
- [ ] Check if chat.db exists
```bash
sqlite3 chat.db
.tables
SELECT * FROM users;
SELECT * FROM messages;
```

### JWT Authentication
- [ ] Test token generation
- [ ] Verify token expiration (15 minutes)
- [ ] Test protected routes
- [ ] Check token validation

### User Registration
- [ ] Test duplicate username
- [ ] Test duplicate email
- [ ] Verify password hashing
- [ ] Check email format validation

### Chat Functionality
- [ ] Test message sending
- [ ] Verify message storage
- [ ] Check message retrieval
- [ ] Test unauthorized access

## 🔧 Common Issues

### 422 Unprocessable Entity
- Check password requirements
- Verify email format
- Ensure username format

### 401 Unauthorized
- Token expired
- Invalid token
- Wrong credentials

### Database Errors
- Check file permissions
- Verify table creation
- Check foreign key constraints

## 📝 API Documentation

Access Swagger UI: http://localhost:8000/docs

## 🛠️ Development Tools

### Backend Testing
```bash
# Check database
sqlite3 chat.db

# Test endpoints
curl -X GET "http://localhost:8000/health"
```

### Frontend Testing
```bash
# Run tests
cd frontend
npm test

# Build for production
npm run build
```

## 🔐 Security Notes

1. Token expiration: 15 minutes
2. Password hashing with bcrypt
3. Protected routes with JWT
4. Input validation on both ends
5. CORS configuration

## ⚠️ Pre-Push Checklist

1. Remove all test accounts
2. Clear test messages
3. Check environment variables
4. Verify CORS settings
5. Test all endpoints
6. Build frontend
7. Update documentation

---

<div align="center">
Made by Alessio Benincasa 
</div>

## 🎨 UI Components

### Login Page
- Beautiful gradient background
- Animated form inputs
- Error handling with shake animation
- Responsive design

### Chat Interface
- Modern message bubbles
- User and AI avatars
- Real-time message updates
- Smooth scrolling
- Responsive layout

## 🎯 Usage

1. **Register a new account**
   - Visit `/register`
   - Fill in your details
   - Submit the form

2. **Login to your account**
   - Visit `/login`
   - Enter your credentials
   - Get redirected to chat

3. **Start chatting**
   - Type your message
   - Send and receive AI responses
   - View message history



