# Poker Tracker API Documentation

## Overview

The Poker Tracker API provides endpoints for managing players, poker sessions, and transactions. The API follows RESTful principles and returns JSON responses.

## Base URL

```
http://localhost:3000/api/v1
```

## Authentication

Currently, the API does not require authentication. This will be added in future versions.

## Response Format

All API responses follow this format:

```json
{
  "success": true,
  "data": { ... },
  "message": "Optional message"
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
    "currentBankroll": "$1000.00",
    "totalSessions": 0,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
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
  "data": [
    {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "currentBankroll": "$1000.00",
      "totalSessions": 5,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
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
    "currentBankroll": "$1000.00",
    "totalSessions": 5,
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
      "currentBankroll": "$1000.00",
      "totalSessions": 5,
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
  "message": "Player bankroll updated successfully"
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
    "player": {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "currentBankroll": "$1000.00"
    },
    "stats": {
      "totalSessions": 5,
      "totalBuyIn": "$5000.00",
      "totalCashOut": "$5500.00",
      "netProfit": "$500.00",
      "winRate": 60.0,
      "winningSessions": 3,
      "losingSessions": 2
    },
    "sessions": [
      {
        "id": "uuid",
        "location": "Casino A",
        "stakes": "$1/$2",
        "startTime": "2024-01-01T00:00:00.000Z",
        "endTime": "2024-01-01T04:00:00.000Z",
        "netResult": "$100.00",
        "duration": 240
      }
    ]
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
  "message": "Player deleted successfully"
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
    "id": "uuid",
    "playerId": "uuid",
    "location": "Casino A",
    "stakes": "$1/$2",
    "startTime": "2024-01-01T00:00:00.000Z",
    "status": "ACTIVE",
    "totalBuyIn": "$200.00",
    "totalCashOut": "$0.00",
    "netResult": "-$200.00",
    "notes": "Starting session at table 5",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
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
    "id": "uuid",
    "playerId": "uuid",
    "location": "Casino A",
    "stakes": "$1/$2",
    "startTime": "2024-01-01T00:00:00.000Z",
    "endTime": "2024-01-01T04:00:00.000Z",
    "status": "COMPLETED",
    "totalBuyIn": "$200.00",
    "totalCashOut": "$300.00",
    "netResult": "$100.00",
    "duration": 240,
    "hourlyRate": "$25.00",
    "bigBlindsWon": 50,
    "notes": "Great session!",
    "transactions": [
      {
        "id": "uuid",
        "type": "BUY_IN",
        "amount": "$200.00",
        "timestamp": "2024-01-01T00:00:00.000Z",
        "description": "Initial buy-in",
        "notes": null
      }
    ],
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
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
  "message": "Session ended successfully"
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
  "message": "Transaction added successfully"
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
  "message": "Session cancelled successfully"
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
  "message": "Session notes updated successfully"
}
```

### Get Player Sessions

**GET** `/sessions/player/:playerId`

Retrieves all sessions for a specific player.

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "playerId": "uuid",
      "location": "Casino A",
      "stakes": "$1/$2",
      "startTime": "2024-01-01T00:00:00.000Z",
      "endTime": "2024-01-01T04:00:00.000Z",
      "status": "COMPLETED",
      "totalBuyIn": "$200.00",
      "totalCashOut": "$300.00",
      "netResult": "$100.00",
      "duration": 240,
      "hourlyRate": "$25.00",
      "bigBlindsWon": 50,
      "notes": "Great session!",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
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
    "id": "uuid",
    "playerId": "uuid",
    "location": "Casino A",
    "stakes": "$1/$2",
    "startTime": "2024-01-01T00:00:00.000Z",
    "status": "ACTIVE",
    "totalBuyIn": "$200.00",
    "totalCashOut": "$0.00",
    "netResult": "-$200.00",
    "notes": "Starting session at table 5",
    "transactions": [
      {
        "id": "uuid",
        "type": "BUY_IN",
        "amount": "$200.00",
        "timestamp": "2024-01-01T00:00:00.000Z",
        "description": "Initial buy-in",
        "notes": null
      }
    ],
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

## Error Codes

- `400` - Bad Request: Invalid input data
- `404` - Not Found: Resource not found
- `500` - Internal Server Error: Server error

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
