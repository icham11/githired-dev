# API Documentation

Base URL: `http://localhost:3001`

## Authentication

All authenticated endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

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
  "difficulty": "string (required, e.g., 'Junior', 'Mid-level', 'Senior')"
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
  "userMessage": "string (required)"
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

- `401` - Unauthorized
- `404` - Session not found
- `500` - Internal server error

---

### 3. End Interview Session

**POST** `/interview/end`

End an interview session.

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
    "feedback": "Overall feedback"
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

Get current user's profile with stats and gamification data.

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

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (missing or invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

---

## Error Response Format

All error responses follow this format:

```json
{
  "message": "Error description"
}
```

Or for validation errors:

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

Required environment variables:

```env
PORT=3000
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_NAME=githired_development
DB_HOST=127.0.0.1
JWT_SECRET=your_jwt_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback
MIDTRANS_SERVER_KEY=your_midtrans_server_key
MIDTRANS_CLIENT_KEY=your_midtrans_client_key
GEMINI_API_KEY=your_gemini_api_key
IMAGEKIT_PUBLIC_KEY=your_imagekit_public_key
IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key
IMAGEKIT_URL_ENDPOINT=your_imagekit_url
```
