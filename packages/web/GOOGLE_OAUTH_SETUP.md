# Google OAuth Setup Guide

This guide will help you set up Google OAuth authentication for the Poker Tracker application.

## Prerequisites

- A Google account
- Access to Google Cloud Console

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Enter project name: "Poker Tracker" (or your preferred name)
4. Click "Create"

## Step 2: Enable Google+ API

1. In the Google Cloud Console, go to "APIs & Services" → "Library"
2. Search for "Google+ API" or "Google Identity"
3. Click on it and press "Enable"

## Step 3: Create OAuth 2.0 Credentials

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth 2.0 Client IDs"
3. If prompted, configure the OAuth consent screen first:
   - Choose "External" user type
   - Fill in the required fields:
     - App name: "Poker Tracker"
     - User support email: your email
     - Developer contact: your email
   - Add scopes: `email`, `profile`, `openid`
   - Add test users if needed

4. For the OAuth client:
   - Application type: "Web application"
   - Name: "Poker Tracker Web"
   - Authorized JavaScript origins:
     - `http://localhost:3000` (for development)
     - `https://yourdomain.com` (for production)
   - Authorized redirect URIs:
     - `http://localhost:3000/api/auth/callback/google` (for development)
     - `https://yourdomain.com/api/auth/callback/google` (for production)

5. Click "Create"
6. Copy the Client ID and Client Secret

## Step 4: Configure Environment Variables

### Web Application (.env.local)

Create a `.env.local` file in the web package:

```bash
# NextAuth.js Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-key-change-this-in-production
GOOGLE_CLIENT_ID=your-google-client-id-here
GOOGLE_CLIENT_SECRET=your-google-client-secret-here

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:4000
```

### API Application (.env)

Update your API `.env` file:

```bash
# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-must-be-32-chars-min
JWT_EXPIRES_IN=7d

# ... other existing variables
```

## Step 5: Generate Secrets

### NextAuth Secret

```bash
openssl rand -base64 32
```

### JWT Secret

```bash
openssl rand -base64 32
```

## Step 6: Test the Setup

1. Start the API server:

   ```bash
   cd packages/api
   npm run dev
   ```

2. Start the web server:

   ```bash
   cd packages/web
   npm run dev
   ```

3. Visit `http://localhost:3000`
4. Click "Sign in with Google"
5. Complete the OAuth flow

## Troubleshooting

### Common Issues

1. **"redirect_uri_mismatch" error**
   - Ensure the redirect URI in Google Console matches exactly: `http://localhost:3000/api/auth/callback/google`

2. **"invalid_client" error**
   - Check that Client ID and Client Secret are correct
   - Ensure the OAuth consent screen is properly configured

3. **"access_denied" error**
   - Check that the user is added to test users (if app is in testing mode)
   - Verify OAuth consent screen configuration

4. **CORS errors**
   - Ensure `NEXT_PUBLIC_API_URL` is set correctly
   - Check that the API server is running on the correct port

### Development vs Production

For production deployment:

1. Update Google OAuth settings with production URLs
2. Change `NEXTAUTH_URL` to your production domain
3. Update `NEXT_PUBLIC_API_URL` to your production API URL
4. Use strong, unique secrets for `NEXTAUTH_SECRET` and `JWT_SECRET`

## Security Notes

- Never commit `.env` files to version control
- Use strong, unique secrets in production
- Regularly rotate your secrets
- Monitor OAuth usage in Google Cloud Console
- Consider implementing rate limiting for auth endpoints

## Next Steps

After successful setup, you can:

1. Customize the OAuth consent screen
2. Add additional OAuth providers (GitHub, Facebook, etc.)
3. Implement role-based access control
4. Add user profile management features
