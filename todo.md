# TODO List

## Security Issues

### 🚨 CRITICAL: Google OAuth Security Vulnerability

**Priority:** High  
**Status:** In Progress  
**Assigned:** Development Team

**Issue:** The API's `/auth/login` endpoint accepts any Google ID, email, and name without verifying that these credentials actually came from Google's OAuth service.

**Impact:**

- Anyone can create fake user accounts by calling the API directly
- Unauthorized access to the system
- Data integrity issues

**Root Cause:**

1. No Google Token Verification - API doesn't verify the Google OAuth token
2. Trusts Client Data - API blindly trusts whatever the client sends
3. Missing Server-Side Validation - No verification that the `googleId` corresponds to a real Google user

**Steps to Reproduce:**

```bash
curl -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "googleId": "fake-google-id-123",
    "email": "fake@example.com",
    "name": "Fake User"
  }'
```

**Solution Required:**

- [ ] Add Google OAuth token verification server-side
- [ ] Validate Google ID against Google's user info endpoint
- [ ] Only accept authenticated Google users
- [ ] Add proper error handling for invalid tokens

**Files Affected:**

- `packages/api/src/api/tsoa/controllers/AuthController.ts`
- `packages/web/src/lib/auth.ts`
- Need to add Google OAuth verification service

---

## Features

### Add Google OAuth Token Verification

**Priority:** High  
**Status:** Pending

**Description:** Implement proper Google OAuth token verification to ensure only legitimate Google users can authenticate.

**Tasks:**

- [ ] Create Google OAuth verification service
- [ ] Update AuthController to verify Google tokens
- [ ] Add proper error handling
- [ ] Write unit tests for verification logic
- [ ] Update API documentation

---

## Bug Fixes

### Fix Authentication Flow

**Priority:** High  
**Status:** Pending

**Description:** The current authentication flow has a security vulnerability where unauthenticated Google IDs can login.

**Tasks:**

- [ ] Investigate current Google OAuth implementation
- [ ] Implement proper validation
- [ ] Test authentication flow
- [ ] Update security documentation

---

## Technical Debt

### Improve Error Handling

**Priority:** Medium  
**Status:** Pending

**Description:** Add better error handling and logging throughout the authentication system.

**Tasks:**

- [ ] Add comprehensive error logging
- [ ] Improve error messages for users
- [ ] Add monitoring and alerting
- [ ] Update error documentation

---

## Documentation

### Update Security Documentation

**Priority:** Medium  
**Status:** Pending

**Description:** Update security documentation to reflect proper OAuth implementation.

**Tasks:**

- [ ] Update GOOGLE_OAUTH_SETUP.md
- [ ] Add security best practices
- [ ] Document token verification process
- [ ] Add troubleshooting guide for OAuth issues

---

_Last Updated: $(date)_
