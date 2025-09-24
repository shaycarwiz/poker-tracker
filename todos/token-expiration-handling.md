# Token Expiration Handling - Poker Tracker

## Overview

This document outlines the implementation requirements for handling JWT token expiration between the web frontend and API backend in the Poker Tracker application.

## Problem Statement

When users are actively using the application, their JWT tokens will eventually expire. The system needs to handle this gracefully to ensure:

1. **Seamless user experience** - Users shouldn't be interrupted by token expiration
2. **Data integrity** - No data loss during token refresh
3. **Security** - Proper handling of expired tokens and refresh tokens
4. **Error handling** - Clear feedback when authentication fails

## Implementation Requirements

### 1. **Automatic Token Refresh**

- **Detection**: Intercept 401 responses from API calls
- **Refresh Logic**: Automatically attempt to refresh token using refresh token
- **Retry**: Retry the original request with the new token
- **Fallback**: If refresh fails, redirect to login page

### 2. **API Client Integration**

- **Request Interceptor**: Add token to all authenticated requests
- **Response Interceptor**: Handle 401 responses and trigger refresh
- **Retry Logic**: Implement exponential backoff for retry attempts
- **Queue Management**: Queue requests during token refresh

### 3. **User Experience**

- **Transparent Refresh**: Users shouldn't notice token refresh happening
- **Loading States**: Show appropriate loading indicators during refresh
- **Error Messages**: Clear feedback when authentication fails
- **Session Persistence**: Maintain user session state during refresh

### 4. **Security Considerations**

- **Token Storage**: Secure storage of tokens (httpOnly cookies preferred)
- **Refresh Token Rotation**: Implement refresh token rotation for security
- **Token Validation**: Validate tokens before making requests
- **Logout Handling**: Clear all tokens on logout

## Technical Implementation

### Frontend (Web App)

```typescript
// API Client with token refresh
class ApiClient {
  private refreshPromise: Promise<string> | null = null;

  async request(url: string, options: RequestInit) {
    // Add token to request
    // Handle 401 responses
    // Implement refresh logic
  }

  private async refreshToken(): Promise<string> {
    // Refresh token implementation
  }
}
```

### Backend (API)

```typescript
// Token refresh endpoint
POST /api/auth/refresh
{
  "refreshToken": "string"
}

// Response
{
  "accessToken": "string",
  "refreshToken": "string",
  "expiresIn": number
}
```

## Testing Scenarios

### 1. **Normal Token Refresh**

- User performs action with valid token
- Token expires during session
- System automatically refreshes token
- User continues without interruption

### 2. **Refresh Token Expired**

- User's refresh token is also expired
- System attempts refresh and fails
- User is redirected to login page
- Clear error message displayed

### 3. **Network Issues During Refresh**

- Token refresh fails due to network issues
- System retries with exponential backoff
- User sees appropriate loading/error states
- Graceful degradation

### 4. **Concurrent Requests**

- Multiple API calls made simultaneously
- Token expires during batch of requests
- All requests are queued and retried with new token
- No duplicate refresh attempts

## Error Handling

### 1. **Token Refresh Failed**

- Display clear error message
- Redirect to login page
- Clear all stored tokens
- Log error for debugging

### 2. **Network Errors**

- Retry with exponential backoff
- Show network error message
- Allow manual retry
- Maintain user state

### 3. **Invalid Tokens**

- Clear invalid tokens immediately
- Redirect to login
- Log security event
- Prevent further API calls

## Configuration

### Environment Variables

```env
# Token expiration times
JWT_ACCESS_TOKEN_EXPIRY=15m
JWT_REFRESH_TOKEN_EXPIRY=7d

# Refresh retry settings
TOKEN_REFRESH_MAX_RETRIES=3
TOKEN_REFRESH_RETRY_DELAY=1000
```

### Frontend Configuration

```typescript
const tokenConfig = {
  refreshThreshold: 5 * 60 * 1000, // 5 minutes before expiry
  maxRetries: 3,
  retryDelay: 1000,
  enableAutoRefresh: true,
};
```

## Monitoring & Logging

### 1. **Metrics to Track**

- Token refresh success rate
- Token refresh failure rate
- Average refresh time
- User session duration

### 2. **Log Events**

- Token refresh attempts
- Token refresh failures
- Authentication errors
- User logout events

## Implementation Priority

### Phase 1: Basic Token Refresh

- Implement automatic token refresh
- Add retry logic for failed requests
- Basic error handling

### Phase 2: Enhanced UX

- Add loading states during refresh
- Implement request queuing
- Improve error messages

### Phase 3: Security & Monitoring

- Add refresh token rotation
- Implement comprehensive logging
- Add security monitoring

## Success Criteria

- [ ] Users can use the app for extended periods without re-authentication
- [ ] Token refresh happens transparently to users
- [ ] No data loss during token refresh process
- [ ] Clear error messages when authentication fails
- [ ] Proper security handling of expired tokens
- [ ] Comprehensive logging and monitoring

## Related Files

- `/packages/web/src/lib/api-client.ts` - API client implementation
- `/packages/web/src/lib/auth.ts` - Authentication utilities
- `/packages/api/src/api/controllers/AuthController.ts` - Auth endpoints
- `/packages/api/src/api/middleware/` - Authentication middleware

---

**Status**: Pending Implementation  
**Priority**: High  
**Estimated Effort**: 2-3 days  
**Dependencies**: JWT implementation, API client setup
