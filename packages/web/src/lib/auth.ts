import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { JWT } from 'next-auth/jwt';

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account) {
        token.accessToken = account.access_token;
        token.googleId = profile?.sub;

        // Call your backend API to register/authenticate user
        try {
          const response = await fetch(
            `${process.env.BACKEND_API_URL}/auth/login`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                googleId: profile?.sub,
                email: profile?.email,
                name: profile?.name,
              }),
            }
          );

          if (response.ok) {
            const data = await response.json();
            // Store the backend JWT tokens
            token.backendToken = data.token;
            token.refreshToken = data.refreshToken;
            token.tokenExpiresAt = Date.now() + data.expiresIn * 1000;
            token.userId = data.user.id;
          }
        } catch (error) {
          console.error('Failed to register user with backend:', error);
        }
      }
      return token;
    },
    async session({ session, token }) {
      // Send properties to the client
      if (token) {
        session.accessToken = token.accessToken as string;
        session.backendToken = token.backendToken as string;
        session.refreshToken = token.refreshToken as string;
        session.tokenExpiresAt = token.tokenExpiresAt as number;
        session.userId = token.userId as string;
        session.user.id = token.googleId as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
};

// Extend the built-in session types
declare module 'next-auth' {
  interface Session {
    accessToken?: string; // Google OAuth token
    backendToken?: string; // Backend API JWT token
    refreshToken?: string; // Backend refresh token
    tokenExpiresAt?: number; // Token expiration timestamp
    userId?: string; // Backend user ID
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken?: string; // Google OAuth token
    googleId?: string; // Google user ID
    backendToken?: string; // Backend API JWT token
    refreshToken?: string; // Backend refresh token
    tokenExpiresAt?: number; // Token expiration timestamp
    userId?: string; // Backend user ID
  }
}
