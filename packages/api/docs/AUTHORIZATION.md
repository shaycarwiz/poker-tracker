# Authorization System

This document describes the authorization system implemented for the Poker Tracker API.

## Overview

The authorization system ensures that users can only access their own data and that sensitive endpoints are properly protected. It builds upon the existing authentication system using JWT tokens.

## Key Components

### 1. Authentication Middleware (`auth.ts`)

- `authenticateToken`: Validates JWT tokens and extracts user information
- `optionalAuth`: Optional authentication for public endpoints that can benefit from user context

### 2. Authorization Middleware (`authorization.ts`)

- `authorizePlayerAccess`: Ensures users can only access their own player data
- `requirePlayerProfile`: Ensures the user has a player profile before accessing player-specific endpoints

### 3. Protected Endpoints

#### Public Endpoints (No Authentication Required)

- `POST /api/players` - Create a new player profile

#### User-Specific Endpoints (Authentication + Player Profile Required)

- `GET /api/players/me` - Get current user's player profile
- `GET /api/players/me/stats` - Get current user's player statistics
- `PATCH /api/players/me/bankroll` - Update current user's bankroll

#### Admin/Cross-User Endpoints (Authentication + Authorization Required)

- `GET /api/players` - List all players (admin only)
- `GET /api/players/search` - Search players (admin only)
- `GET /api/players/:id` - Get specific player (only if it's the user's own player)
- `GET /api/players/:id/stats` - Get specific player stats (only if it's the user's own player)
- `PATCH /api/players/:id/bankroll` - Update specific player bankroll (only if it's the user's own player)
- `DELETE /api/players/:id` - Delete specific player (only if it's the user's own player)

## Security Features

### 1. Player ID Protection

- Player IDs are no longer exposed in query strings for sensitive operations
- The `/me` endpoints automatically use the authenticated user's player ID
- Direct player ID access is restricted to the player's own data

### 2. Email-Based Authorization

- Players are linked to users via email address
- Authorization checks ensure the player's email matches the authenticated user's email
- This prevents users from accessing other players' data even if they know the player ID

### 3. JWT Token Validation

- All protected endpoints require valid JWT tokens
- Tokens are validated for expiration and signature
- User information is extracted from the token payload

## Usage Examples

### Getting Current Player Profile

```bash
curl -H "Authorization: Bearer <jwt-token>" \
     GET /api/players/me
```

### Updating Current Player Bankroll

```bash
curl -H "Authorization: Bearer <jwt-token>" \
     -H "Content-Type: application/json" \
     -X PATCH /api/players/me/bankroll \
     -d '{"amount": 1000, "currency": "USD"}'
```

### Accessing Specific Player (Only Own Data)

```bash
curl -H "Authorization: Bearer <jwt-token>" \
     GET /api/players/123e4567-e89b-12d3-a456-426614174000
```

## Error Responses

### 401 Unauthorized

```json
{
  "error": "Access token required",
  "code": "MISSING_TOKEN"
}
```

### 403 Forbidden

```json
{
  "error": "Access denied. You can only access your own player data.",
  "code": "FORBIDDEN"
}
```

### 404 Not Found

```json
{
  "error": "Player profile not found",
  "code": "PLAYER_PROFILE_NOT_FOUND"
}
```

## Implementation Details

### Player-User Association

Players are associated with users through email addresses. When a user authenticates:

1. The JWT token contains the user's email
2. The authorization middleware looks up the player by email
3. Access is granted only if the player's email matches the user's email

### Database Schema Considerations

The current implementation assumes players have an email field that matches the authenticated user's email. For production use, consider:

- Adding a dedicated `userId` field to the Player entity
- Using Google ID for more reliable user-player association
- Implementing proper user management with separate User and Player entities

## Future Enhancements

1. **Role-Based Access Control**: Implement admin roles for cross-user operations
2. **User-Player Separation**: Separate User and Player entities for better data modeling
3. **Audit Logging**: Track all authorization decisions for security monitoring
4. **Rate Limiting**: Implement rate limiting for sensitive operations
5. **Session Management**: Add session invalidation and token refresh capabilities
