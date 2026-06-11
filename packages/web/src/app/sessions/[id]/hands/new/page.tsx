'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Header } from '@/components/Header';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { HandReplayer } from '@/components/hands/HandReplayer';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { handApi, sessionApi } from '@/lib/api-client';
import { createEmptyFullHandState } from '@/lib/cards';
import type { FullHandState, Session } from '@/types';

export default function NewHandPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.id as string;
  const { t } = useTranslation();
  const [session, setSession] = useState<Session | null>(null);
  const [handState, setHandState] = useState<FullHandState>(
    createEmptyFullHandState()
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSession = async () => {
      try {
        setLoading(true);
        const response = await sessionApi.getById(sessionId);
        if (response.success) {
          const status = response.data.status.toUpperCase();
          if (status !== 'ACTIVE' && status !== 'COMPLETED') {
            setError(t('sessions.hands.sessionNotCapturable'));
          } else {
            setSession(response.data);
          }
        } else {
          setError(t('sessions.loadSessionError'));
        }
      } catch {
        setError(t('sessions.loadSessionError'));
      } finally {
        setLoading(false);
      }
    };

    loadSession();
  }, [sessionId, t]);

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);

      const response = await handApi.create(sessionId, {
        captureType: 'full',
        handState,
      });

      if (response.success && response.data) {
        router.push(`/sessions/${sessionId}/hands/${response.data.handId}`);
      } else {
        setError(t('sessions.hands.captureError'));
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t('sessions.hands.captureError')
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
          {loading ? (
            <LoadingSpinner />
          ) : error && !session ? (
            <ErrorMessage message={error} />
          ) : (
            <>
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">
                  {t('sessions.hands.buildFullHand')}
                </h1>
                {session && (
                  <p className="mt-1 text-sm text-gray-600">
                    {session.location} · {session.stakes.smallBlind}/
                    {session.stakes.bigBlind} {session.stakes.currency}
                  </p>
                )}
              </div>

              {error && (
                <div className="mb-4 rounded-md bg-red-50 p-4 text-sm text-red-700">
                  {error}
                </div>
              )}

              <div className="rounded-lg bg-white p-6 shadow">
                <HandReplayer
                  mode="edit"
                  handState={handState}
                  onChange={setHandState}
                  currency={session?.stakes.currency}
                />
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => router.push(`/sessions/${sessionId}`)}
                  className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? t('common.loading') : t('sessions.hands.saveHand')}
                </button>
              </div>
            </>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
