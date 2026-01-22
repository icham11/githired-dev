# GitHired - AI-Powered Interview & Resume Assistant

🎯 **Your Personal AI Interview Coach & Resume Analyzer**

An all-in-one platform that helps job seekers prepare for interviews and optimize their resumes using artificial intelligence.

## 🌟 Features

- 🎭 **AI-Powered Mock Interviews** - Practice with adaptive interview scenarios
- 📄 **Resume Analysis** - ATS-optimized resume evaluation with detailed feedback
- 🎤 **Speech Recognition & Text-to-Speech** - More natural interview practice
- 💳 **Flexible Pricing** - Free tier + affordable Pro subscription (IDR 50,000)
- 🔐 **Secure Authentication** - JWT + Google OAuth integration
- 🌐 **Bilingual Support** - English & Bahasa Indonesia

---

# API Documentation

**Base URL:** `http://localhost:3001`

## Quick Start

### Authentication

All authenticated endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

---

## 📋 Table of Contents

1. [Auth Endpoints](#auth-endpoints)
2. [Interview Endpoints](#interview-endpoints)
3. [Resume Endpoints](#resume-endpoints)
4. [User Endpoints](#user-endpoints)
5. [Payment Endpoints](#payment-endpoints)
6. [Status Codes](#status-codes)
7. [Environment Variables](#environment-variables)

---

## Auth Endpoints

### 1. Register User

**POST** `/auth/register`

Create a new user account.

**Request Body:**

```json
{
  "username": "string (required)",
  "email": "string (required, valid email)",
  "password": "string (required, min 6 characters)"
}
```

**Response (201):**

```json
{
  "message": "User registered successfully",
  "token": "jwt_token_string",
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com"
  }
}
```

**Error Responses:**

- `400` - Email already exists or validation error
- `500` - Internal server error

---

### 2. Login

**POST** `/auth/login`

Authenticate user and get JWT token.

**Request Body:**

```json
{
  "email": "string (required, valid email)",
  "password": "string (required)"
}
```

**Response (200):**

```json
{
  "message": "Login successful",
  "token": "jwt_token_string",
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com"
  }
}
```

**Error Responses:**

- `401` - Invalid credentials
- `500` - Internal server error

---

### 3. Google OAuth

**GET** `/auth/google`

Redirect to Google OAuth consent screen.

**Query Parameters:** None

**Response:** Redirects to Google authentication

---

### 4. Google OAuth Callback

**GET** `/auth/google/callback`

Handle Google OAuth callback.

**Response:** Redirects to frontend with token in query parameter

```
http://localhost:5173/oauth-success?token=<jwt_token>
```

---

## Interview Endpoints

All interview endpoints require authentication.

### 1. Start Interview Session

**POST** `/interview/start`

Start a new mock interview session.

**Headers:**

```
Authorization: Bearer <token>
```

**Request Body:**

```json
{
  "role": "string (required, e.g., 'Frontend Developer')",
  "difficulty": "string (required, e.g., 'Junior', 'Mid-level', 'Senior')",
  "language": "string (optional, 'English' or 'Indonesian', default: 'English')"
}
```

**Response (201):**

```json
{
  "message": "Interview session created",
  "session": {
    "id": 1,
    "userId": 1,
    "role": "Frontend Developer",
    "difficulty": "Junior",
    "language": "English",
    "chatHistory": "[]",
    "score": 0,
    "feedback": null,
    "createdAt": "2026-01-22T00:00:00.000Z",
    "updatedAt": "2026-01-22T00:00:00.000Z"
  }
}
```

**Error Responses:**

- `401` - Unauthorized
- `403` - Free limit reached (max 1 session for free users)
- `500` - Internal server error

---

### 2. Send Chat Message

**POST** `/interview/chat`

Send a message during the interview and get AI response.

**Headers:**

```
Authorization: Bearer <token>
```

**Request Body:**

```json
{
  "sessionId": "number (required)",
  "message": "string (required)"
}
```

**Response (200):**

```json
{
  "message": "Message processed",
  "aiResponse": {
    "message": "AI response text"
  },
  "history": [
    {
      "role": "user",
      "content": "User message"
    },
    {
      "role": "assistant",
      "content": "AI response"
    }
  ]
}
```

**Error Responses:**

- `400` - Empty message
- `401` - Unauthorized
- `404` - Session not found
- `500` - Internal server error

---

### 3. End Interview Session

**POST** `/interview/end`

End an interview session and get final evaluation.

**Headers:**

```
Authorization: Bearer <token>
```

**Request Body:**

```json
{
  "sessionId": "number (required)"
}
```

**Response (200):**

```json
{
  "message": "Interview session ended",
  "session": {
    "id": 1,
    "score": 85,
    "feedback": "Overall feedback with improvement suggestions"
  }
}
```

**Error Responses:**

- `401` - Unauthorized
- `404` - Session not found
- `500` - Internal server error

---

### 4. Get Interview Session

**GET** `/interview/:sessionId`

Retrieve details of a specific interview session.

**Headers:**

```
Authorization: Bearer <token>
```

**URL Parameters:**

- `sessionId` - Interview session ID

**Response (200):**

```json
{
  "id": 1,
  "userId": 1,
  "role": "Frontend Developer",
  "difficulty": "Junior",
  "language": "English",
  "chatHistory": "[...]",
  "score": 85,
  "feedback": "Overall feedback",
  "createdAt": "2026-01-22T00:00:00.000Z"
}
```

**Error Responses:**

- `401` - Unauthorized
- `404` - Session not found
- `500` - Internal server error

---

## Resume Endpoints

All resume endpoints require authentication.

### 1. Analyze Resume

**POST** `/resume/analyze`

Upload and analyze a PDF resume. **Pro users only**.

**Headers:**

```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Request Body (multipart/form-data):**

- `resume` - PDF file (required)

**Response (200):**

```json
{
  "id": 1,
  "userId": 1,
  "content": "Extracted resume text...",
  "score": 85,
  "feedback": "Overall feedback",
  "feedback_en": "Feedback in English",
  "feedback_id": "Feedback in Indonesian",
  "fileUrl": "https://imagekit.io/...",
  "createdAt": "2026-01-22T00:00:00.000Z"
}
```

**Analysis Criteria:**

- **ATS Compatibility (25 points)** - Format, keywords, structure
- **Content Quality (35 points)** - Achievements, action verbs, clarity
- **Professional Impact (25 points)** - Career progression, impact statement

**Error Responses:**

- `400` - No file uploaded or invalid PDF
- `401` - Unauthorized
- `403` - Feature available for Pro users only
- `500` - Internal server error

---

## User Endpoints

All user endpoints require authentication.

### 1. Get User Profile

**GET** `/user/profile`

Get current user's profile with stats and subscription status.

**Headers:**

```
Authorization: Bearer <token>
```

**Response (200):**

```json
{
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "isPro": true
  },
  "stats": {
    "resumeCount": 5,
    "interviewCount": 10,
    "avgScore": 82
  },
  "gamification": {
    "tier": "Silver",
    "progress": 60,
    "nextTier": "Gold"
  }
}
```

**Error Responses:**

- `401` - Unauthorized
- `500` - Internal server error

---

### 2. Get User History

**GET** `/user/history`

Get user's resume analysis and interview history.

**Headers:**

```
Authorization: Bearer <token>
```

**Response (200):**

```json
{
  "resumes": [
    {
      "id": 1,
      "score": 85,
      "fileUrl": "https://...",
      "createdAt": "2026-01-22T00:00:00.000Z"
    }
  ],
  "interviews": [
    {
      "id": 1,
      "role": "Frontend Developer",
      "score": 90,
      "createdAt": "2026-01-22T00:00:00.000Z"
    }
  ]
}
```

**Error Responses:**

- `401` - Unauthorized
- `500` - Internal server error

---

## Payment Endpoints

### 1. Initiate Payment

**POST** `/payment/initiate`

Initialize payment for Pro subscription (IDR 50,000).

**Headers:**

```
Authorization: Bearer <token>
```

**Request Body:** None

**Response (200):**

```json
{
  "token": "midtrans_snap_token",
  "redirect_url": "https://app.sandbox.midtrans.com/snap/v2/..."
}
```

**Payment Methods:**
- Credit Card
- GoPay
- Virtual Account (BCA, BNI, BRI)
- QRIS

**Error Responses:**

- `401` - Unauthorized
- `500` - Internal server error

---

### 2. Payment Notification (Webhook)

**POST** `/payment/notification`

Handle payment notification from Midtrans. **No authentication required** (called by Midtrans).

**Request Body:**

```json
{
  "order_id": "ORDER-1-1234567890",
  "transaction_status": "settlement",
  "fraud_status": "accept",
  "gross_amount": "50000.00"
}
```

**Response (200):**

```
OK
```

**Error Responses:**

- `400` - Missing order_id
- `404` - Transaction not found
- `500` - Internal server error

---

## Status Codes

| Code | Meaning |
|------|---------|
| `200` | Success |
| `201` | Created |
| `400` | Bad Request (validation error) |
| `401` | Unauthorized (missing or invalid token) |
| `403` | Forbidden (insufficient permissions) |
| `404` | Not Found |
| `500` | Internal Server Error |

---

## Error Response Format

Standard error response:

```json
{
  "message": "Error description"
}
```

Validation error:

```json
{
  "errors": [
    {
      "msg": "Error message",
      "param": "field_name",
      "location": "body"
    }
  ]
}
```

---

## Environment Variables

Required environment variables for backend setup:

```env
# Server
PORT=3001
NODE_ENV=development

# Database
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_NAME=githired_development
DB_HOST=127.0.0.1
DB_PORT=5432

# Authentication
JWT_SECRET=your_jwt_secret
JWT_EXPIRATION=7d

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3001/auth/google/callback

# Payment (Midtrans)
MIDTRANS_SERVER_KEY=your_midtrans_server_key
MIDTRANS_CLIENT_KEY=your_midtrans_client_key
MIDTRANS_ENVIRONMENT=sandbox

# AI Service (Groq)
GROQ_API_KEY=your_groq_api_key
USE_MOCK_AI=false

# File Storage (ImageKit)
IMAGEKIT_PUBLIC_KEY=your_imagekit_public_key
IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key
IMAGEKIT_URL_ENDPOINT=your_imagekit_url
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js v16+
- PostgreSQL 12+
- npm or yarn

### Installation

```bash
# Clone repository
git clone https://github.com/icham11/icham11.git
cd IP-RMT68

# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### Setup Database

```bash
cd server
npx sequelize-cli db:create
npx sequelize-cli db:migrate
```

### Run Development Server

```bash
# Backend (from server directory)
npm run dev

# Frontend (from client directory)
npm run dev
```

Backend will run at `http://localhost:3001`  
Frontend will run at `http://localhost:5173`

---

## 📝 License

This project is licensed under the MIT License.

---

## 👨‍💻 Support

For API support or issues, please open an issue on the GitHub repository.
