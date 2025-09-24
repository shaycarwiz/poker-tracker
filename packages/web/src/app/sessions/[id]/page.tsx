'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Header } from '@/components/Header';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { SessionActions } from '@/components/sessions/SessionActions';
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

  // Calculate session metrics
  const totalBuyIn = session.transactions
    .filter((t) => t.type === 'buy_in' || t.type === 'rebuy')
    .reduce((sum, t) => sum + t.amount.amount, 0);

  const totalCashOut = session.transactions
    .filter((t) => t.type === 'cash_out')
    .reduce((sum, t) => sum + t.amount.amount, 0);

  const netResult = totalCashOut - totalBuyIn;
  const isProfit = netResult >= 0;

  const duration = session.endedAt
    ? Math.floor(
        (new Date(session.endedAt).getTime() -
          new Date(session.startedAt).getTime()) /
          (1000 * 60)
      )
    : Math.floor(
        (Date.now() - new Date(session.startedAt).getTime()) / (1000 * 60)
      );

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-gray-50">
        <Header />
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="space-y-6">
            {/* Session Actions */}
            <SessionActions session={session} onSessionUpdate={setSession} />

            {/* Session Details */}
            <div className="rounded-lg bg-white shadow">
              <div className="px-4 py-5 sm:p-6">
                <div className="mb-6">
                  <h1 className="text-2xl font-bold text-gray-900">
                    Session Details
                  </h1>
                  <p className="mt-2 text-gray-600">
                    Session started on{' '}
                    {new Date(session.startedAt).toLocaleString()}
                    {session.endedAt && (
                      <span>
                        {' '}
                        and ended on{' '}
                        {new Date(session.endedAt).toLocaleString()}
                      </span>
                    )}
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">
                      Location
                    </h3>
                    <p className="mt-1 text-lg text-gray-900">
                      {session.location}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500">
                      Stakes
                    </h3>
                    <p className="mt-1 text-lg text-gray-900">
                      ${session.stakes.smallBlind}/${session.stakes.bigBlind}{' '}
                      {session.stakes.currency}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500">
                      Duration
                    </h3>
                    <p className="mt-1 text-lg text-gray-900">
                      {formatDuration(duration)}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500">
                      Status
                    </h3>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        session.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : session.status === 'completed'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {session.status}
                    </span>
                  </div>
                </div>

                {/* Financial Summary */}
                <div className="mt-8 rounded-lg bg-gray-50 p-6">
                  <h3 className="mb-4 text-lg font-medium text-gray-900">
                    Financial Summary
                  </h3>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">
                        Total Buy-ins
                      </h4>
                      <p className="mt-1 text-2xl font-semibold text-gray-900">
                        ${totalBuyIn.toFixed(2)} {session.initialBuyIn.currency}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">
                        Total Cash-outs
                      </h4>
                      <p className="mt-1 text-2xl font-semibold text-gray-900">
                        ${totalCashOut.toFixed(2)}{' '}
                        {session.initialBuyIn.currency}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">
                        Net Result
                      </h4>
                      <p
                        className={`mt-1 text-2xl font-semibold ${
                          isProfit ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {isProfit ? '+' : ''}${netResult.toFixed(2)}{' '}
                        {session.initialBuyIn.currency}
                      </p>
                    </div>
                  </div>
                </div>

                {session.notes && (
                  <div className="mt-8">
                    <h3 className="text-sm font-medium text-gray-500">Notes</h3>
                    <p className="mt-1 whitespace-pre-wrap text-lg text-gray-900">
                      {session.notes}
                    </p>
                  </div>
                )}

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
                            <span className="font-medium capitalize">
                              {transaction.type.replace('_', ' ')}
                            </span>
                            {transaction.description && (
                              <p className="text-sm text-gray-500">
                                {transaction.description}
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <span className="font-medium">
                              ${transaction.amount.amount.toFixed(2)}{' '}
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
        </div>
      </main>
    </ProtectedRoute>
  );
}
