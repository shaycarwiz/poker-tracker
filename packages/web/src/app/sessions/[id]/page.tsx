'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Header } from '@/components/Header';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { sessionApi } from '@/lib/api-client';
import type { Session } from '@/types';

export default function SessionDetailPage() {
  const params = useParams();
  const sessionId = params.id as string;
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await sessionApi.getById(sessionId);

        if (response.success) {
          setSession(response.data);
        } else {
          setError('Failed to load session');
        }
      } catch (err) {
        console.error('Error fetching session:', err);
        setError(err instanceof Error ? err.message : 'Failed to load session');
      } finally {
        setLoading(false);
      }
    };

    if (sessionId) {
      fetchSession();
    }
  }, [sessionId]);

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

  if (!session) {
    return (
      <ProtectedRoute>
        <main className="min-h-screen bg-gray-50">
          <Header />
          <div className="flex min-h-screen items-center justify-center">
            <ErrorMessage message="Session not found" />
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
          <div className="rounded-lg bg-white shadow">
            <div className="px-4 py-5 sm:p-6">
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">
                  Session Details
                </h1>
                <p className="mt-2 text-gray-600">
                  Session started on{' '}
                  {new Date(session.startedAt).toLocaleString()}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Location
                  </h3>
                  <p className="mt-1 text-lg text-gray-900">
                    {session.location}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500">Stakes</h3>
                  <p className="mt-1 text-lg text-gray-900">
                    ${session.stakes.smallBlind}/${session.stakes.bigBlind}{' '}
                    {session.stakes.currency}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Initial Buy-in
                  </h3>
                  <p className="mt-1 text-lg text-gray-900">
                    {session.initialBuyIn.amount}{' '}
                    {session.initialBuyIn.currency}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500">Status</h3>
                  <p className="mt-1 text-lg capitalize text-gray-900">
                    {session.status}
                  </p>
                </div>

                {session.notes && (
                  <div className="sm:col-span-2 lg:col-span-3">
                    <h3 className="text-sm font-medium text-gray-500">Notes</h3>
                    <p className="mt-1 text-lg text-gray-900">
                      {session.notes}
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-8">
                <h3 className="mb-4 text-lg font-medium text-gray-900">
                  Transactions
                </h3>
                {session.transactions.length > 0 ? (
                  <div className="space-y-2">
                    {session.transactions.map((transaction) => (
                      <div
                        key={transaction.id}
                        className="flex items-center justify-between rounded-lg bg-gray-50 p-3"
                      >
                        <div>
                          <span className="font-medium">
                            {transaction.type}
                          </span>
                          {transaction.description && (
                            <p className="text-sm text-gray-500">
                              {transaction.description}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <span className="font-medium">
                            {transaction.amount.amount}{' '}
                            {transaction.amount.currency}
                          </span>
                          <p className="text-sm text-gray-500">
                            {new Date(transaction.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No transactions yet</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </ProtectedRoute>
  );
}
