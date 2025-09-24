'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { sessionApi } from '@/lib/api-client';
import type { Session } from '@/types';

export default function SessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await sessionApi.getAll();

        if (response.success) {
          setSessions(response.data.sessions || []);
        } else {
          setError('Failed to load sessions');
        }
      } catch (err) {
        console.error('Error fetching sessions:', err);
        setError(
          err instanceof Error ? err.message : 'Failed to load sessions'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, []);

  if (loading) {
    return (
      <ProtectedRoute>
        <main className="min-h-screen bg-gray-50">
          <Header />
          <div className="flex min-h-screen items-center justify-center">
            <LoadingSpinner size="lg" />
          </div>
        </main>
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <ProtectedRoute>
        <main className="min-h-screen bg-gray-50">
          <Header />
          <div className="flex min-h-screen items-center justify-center">
            <ErrorMessage message={error} />
          </div>
        </main>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-gray-50">
        <Header />
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Sessions</h1>
              <p className="mt-2 text-gray-600">Your poker session history</p>
            </div>
            <Link
              href="/sessions/new"
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Start New Session
            </Link>
          </div>

          {sessions.length === 0 ? (
            <div className="rounded-lg bg-white shadow">
              <div className="px-4 py-12 text-center sm:px-6">
                <h3 className="text-lg font-medium text-gray-900">
                  No sessions yet
                </h3>
                <p className="mt-2 text-gray-500">
                  Get started by creating your first poker session.
                </p>
                <div className="mt-6">
                  <Link
                    href="/sessions/new"
                    className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                  >
                    Start Your First Session
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {sessions.map((session) => (
                <Link
                  key={session.sessionId}
                  href={`/sessions/${session.sessionId}`}
                  className="block rounded-lg bg-white shadow transition-shadow hover:shadow-md"
                >
                  <div className="px-4 py-5 sm:p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-gray-900">
                          {session.location}
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                          {session.stakes.smallBlind}/{session.stakes.bigBlind}{' '}
                          {session.stakes.currency} • Started{' '}
                          {new Date(session.startedAt).toLocaleDateString()}
                        </p>
                        {session.notes && (
                          <p className="mt-2 text-sm text-gray-600">
                            {session.notes}
                          </p>
                        )}
                      </div>
                      <div className="ml-4 text-right">
                        <span className="text-lg font-medium text-gray-900">
                          {session.initialBuyIn.amount}{' '}
                          {session.initialBuyIn.currency}
                        </span>
                        <p className="text-sm capitalize text-gray-500">
                          {session.status}
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </ProtectedRoute>
  );
}
