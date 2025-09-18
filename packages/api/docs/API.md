# Poker Tracker API Documentation

## Overview

The Poker Tracker API provides endpoints for managing players, poker sessions, and transactions. The API follows RESTful principles and returns JSON responses.

## Base URL

```
http://localhost:3000/api/v1
```

## Authentication

The API uses JWT (JSON Web Token) authentication with Google OAuth integration. Most endpoints require authentication via Bearer token in the Authorization header.

### Getting Started

1. **Login**: Use the `/api/auth/login` endpoint with Google OAuth credentials to obtain a JWT token
2. **Include Token**: Add the token to the Authorization header: `Authorization: Bearer <your-jwt-token>`
3. **Access Protected Endpoints**: Use the token to access protected resources

### Authentication Endpoints

#### Login

**POST** `/api/auth/login`

Authenticate with Google OAuth and receive a JWT token.

**Request Body:**

```json
{
  "googleId": "1234567890",
  "email": "john@example.com",
  "name": "John Doe"
}
```

**Response:**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "John Doe",
    "email": "john@example.com",
    "currentBankroll": 1000,
    "totalSessions": 5
  }
}
```

#### Get Profile

**GET** `/api/auth/profile`

Retrieve the authenticated user's profile information.

**Headers:**

- `Authorization: Bearer <jwt-token>`

**Response:**

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "name": "John Doe",
  "email": "john@example.com",
  "currentBankroll": 1000,
  "totalSessions": 5,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

#### Update Profile

**PUT** `/api/auth/profile`

Update the authenticated user's profile information.

**Headers:**

- `Authorization: Bearer <jwt-token>`

**Request Body:**

```json
{
  "name": "John Smith",
  "email": "johnsmith@example.com"
}
```

**Response:**

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "name": "John Smith",
  "email": "johnsmith@example.com",
  "currentBankroll": 1000,
  "totalSessions": 5,
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

## Response Format

All API responses follow this format:

```json
{
  "success": true,
  "data": { ... }
}
```

Error responses:

```json
{
  "error": "Error description",
  "message": "Detailed error message"
}
```

## Players API

### Create Player

**POST** `/players`

Creates a new player.

**Request Body:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "initialBankroll": {
    "amount": 1000,
    "currency": "USD"
  }
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "bankroll": {
      "amount": 1000,
      "currency": "USD"
    },
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Get All Players

**GET** `/players`

Retrieves all players.

**Response:**

```json
{
  "success": true,
  "data": {
    "players": [
      {
        "id": "uuid",
        "name": "John Doe",
        "email": "john@example.com",
        "bankroll": {
          "amount": 1000,
          "currency": "USD"
        },
        "totalSessions": 5,
        "totalWinnings": {
          "amount": 500,
          "currency": "USD"
        },
        "winRate": 60.0,
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 10
  }
}
```

### Get Player by ID

**GET** `/players/:id`

Retrieves a specific player by ID.

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "bankroll": {
      "amount": 1000,
      "currency": "USD"
    },
    "totalSessions": 5,
    "totalWinnings": {
      "amount": 500,
      "currency": "USD"
    },
    "winRate": 60.0,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Search Players

**GET** `/players/search?name=John`

Searches for players by name.

**Query Parameters:**

- `name` (required): Name to search for

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "bankroll": {
        "amount": 1000,
        "currency": "USD"
      },
      "totalSessions": 5,
      "totalWinnings": {
        "amount": 500,
        "currency": "USD"
      },
      "winRate": 60.0,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### Update Player Bankroll

**PATCH** `/players/:id/bankroll`

Updates a player's bankroll.

**Request Body:**

```json
{
  "amount": 500,
  "currency": "USD"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "playerId": "uuid",
    "newBankroll": {
      "amount": 1500,
      "currency": "USD"
    },
    "addedAmount": {
      "amount": 500,
      "currency": "USD"
    },
    "addedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Get Player Statistics

**GET** `/players/:id/stats`

Retrieves detailed statistics for a player.

**Response:**

```json
{
  "success": true,
  "data": {
    "playerId": "uuid",
    "totalSessions": 0,
    "totalWinnings": 0,
    "winRate": 0,
    "averageSession": 0
  }
}
```

### Delete Player

**DELETE** `/players/:id`

Deletes a player (only if they have no active sessions).

**Response:**

```json
{
  "success": true,
  "data": {
    "message": "Player deleted successfully"
  }
}
```

## Sessions API

### Start Session

**POST** `/sessions`

Starts a new poker session.

**Request Body:**

```json
{
  "playerId": "uuid",
  "location": "Casino A",
  "stakes": {
    "smallBlind": {
      "amount": 1,
      "currency": "USD"
    },
    "bigBlind": {
      "amount": 2,
      "currency": "USD"
    }
  },
  "initialBuyIn": {
    "amount": 200,
    "currency": "USD"
  },
  "notes": "Starting session at table 5"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "sessionId": "uuid",
    "playerId": "uuid",
    "location": "Casino A",
    "stakes": {
      "smallBlind": 1,
      "bigBlind": 2,
      "currency": "USD"
    },
    "initialBuyIn": {
      "amount": 200,
      "currency": "USD"
    },
    "notes": "Starting session at table 5",
    "status": "ACTIVE",
    "startedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Get Session by ID

**GET** `/sessions/:id`

Retrieves a specific session by ID.

**Response:**

```json
{
  "success": true,
  "data": {
    "sessionId": "uuid",
    "playerId": "uuid",
    "location": "Casino A",
    "stakes": {
      "smallBlind": 1,
      "bigBlind": 2,
      "currency": "USD"
    },
    "initialBuyIn": {
      "amount": 200,
      "currency": "USD"
    },
    "currentCashOut": {
      "amount": 300,
      "currency": "USD"
    },
    "profitLoss": {
      "amount": 100,
      "currency": "USD"
    },
    "status": "COMPLETED",
    "notes": "Great session!",
    "transactions": [
      {
        "id": "uuid",
        "type": "BUY_IN",
        "amount": {
          "amount": 200,
          "currency": "USD"
        },
        "description": "Initial buy-in",
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "startedAt": "2024-01-01T00:00:00.000Z",
    "endedAt": "2024-01-01T04:00:00.000Z",
    "duration": 240
  }
}
```

### End Session

**POST** `/sessions/:id/end`

Ends an active session.

**Request Body:**

```json
{
  "finalCashOut": {
    "amount": 300,
    "currency": "USD"
  },
  "notes": "Great session!"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "sessionId": "uuid",
    "playerId": "uuid",
    "finalCashOut": {
      "amount": 300,
      "currency": "USD"
    },
    "profitLoss": {
      "amount": 100,
      "currency": "USD"
    },
    "duration": 240,
    "status": "COMPLETED",
    "endedAt": "2024-01-01T04:00:00.000Z"
  }
}
```

### Add Transaction

**POST** `/sessions/:id/transactions`

Adds a transaction to an active session.

**Request Body:**

```json
{
  "type": "REBUY",
  "amount": {
    "amount": 100,
    "currency": "USD"
  },
  "description": "Additional buy-in",
  "notes": "Lost a big pot, need more chips"
}
```

**Transaction Types:**

- `BUY_IN`: Initial buy-in
- `REBUY`: Additional buy-in during session
- `CASH_OUT`: Cash out from session

**Response:**

```json
{
  "success": true,
  "data": {
    "transactionId": "uuid",
    "sessionId": "uuid",
    "type": "REBUY",
    "amount": {
      "amount": 100,
      "currency": "USD"
    },
    "description": "Additional buy-in",
    "addedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Cancel Session

**POST** `/sessions/:id/cancel`

Cancels an active session.

**Request Body:**

```json
{
  "reason": "Emergency - need to leave"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "message": "Session cancelled successfully"
  }
}
```

### Update Session Notes

**PATCH** `/sessions/:id/notes`

Updates session notes.

**Request Body:**

```json
{
  "notes": "Updated session notes"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "message": "Session notes updated successfully"
  }
}
```

### Get Player Sessions

**GET** `/sessions/player/:playerId`

Retrieves all sessions for a specific player.

**Response:**

```json
{
  "success": true,
  "data": {
    "sessions": [
      {
        "sessionId": "uuid",
        "playerId": "uuid",
        "location": "Casino A",
        "stakes": {
          "smallBlind": 1,
          "bigBlind": 2,
          "currency": "USD"
        },
        "initialBuyIn": {
          "amount": 200,
          "currency": "USD"
        },
        "currentCashOut": {
          "amount": 300,
          "currency": "USD"
        },
        "profitLoss": {
          "amount": 100,
          "currency": "USD"
        },
        "status": "COMPLETED",
        "notes": "Great session!",
        "transactions": [],
        "startedAt": "2024-01-01T00:00:00.000Z",
        "endedAt": "2024-01-01T04:00:00.000Z",
        "duration": 240
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 10
  }
}
```

### Get Active Session

**GET** `/sessions/player/:playerId/active`

Retrieves the active session for a specific player.

**Response:**

```json
{
  "success": true,
  "data": {
    "sessionId": "uuid",
    "playerId": "uuid",
    "location": "Casino A",
    "stakes": {
      "smallBlind": 1,
      "bigBlind": 2,
      "currency": "USD"
    },
    "initialBuyIn": {
      "amount": 200,
      "currency": "USD"
    },
    "currentCashOut": {
      "amount": 0,
      "currency": "USD"
    },
    "profitLoss": {
      "amount": -200,
      "currency": "USD"
    },
    "status": "ACTIVE",
    "notes": "Starting session at table 5",
    "transactions": [
      {
        "id": "uuid",
        "type": "BUY_IN",
        "amount": {
          "amount": 200,
          "currency": "USD"
        },
        "description": "Initial buy-in",
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "startedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

## Error Codes

- `400` - Bad Request: Invalid input data
- `401` - Unauthorized: Authentication required or invalid token
- `404` - Not Found: Resource not found
- `500` - Internal Server Error: Server error

### Authentication Error Codes

- `MISSING_FIELDS` - Required authentication fields are missing
- `UNAUTHORIZED` - Authentication token is missing or invalid
- `PLAYER_NOT_FOUND` - Player account not found
- `LOGIN_ERROR` - Error during login process
- `PROFILE_ERROR` - Error retrieving profile
- `UPDATE_PROFILE_ERROR` - Error updating profile

## Rate Limiting

The API implements rate limiting:

- 100 requests per 15 minutes per IP address
- Exceeded requests return a 429 status code

## Health Check

**GET** `/health`

Returns server health status.

**Response:**

```json
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 3600,
  "environment": "development"
}
```
