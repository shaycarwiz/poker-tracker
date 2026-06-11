'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Header } from '@/components/Header';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { HandReplayer } from '@/components/hands/HandReplayer';
import { StreetBoard } from '@/components/hands/StreetBoard';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { formatCard, cardSuitColor } from '@/lib/cards';
import { handApi } from '@/lib/api-client';
import type { FullHandState, Hand, SnapshotHandState } from '@/types';

export default function HandDetailPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.id as string;
  const handId = params.handId as string;
  const { t } = useTranslation();
  const [hand, setHand] = useState<Hand | null>(null);
  const [mode, setMode] = useState<'review' | 'edit'>('review');
  const [editState, setEditState] = useState<FullHandState | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadHand = async () => {
      try {
        setLoading(true);
        const response = await handApi.getById(handId);
        if (response.success && response.data) {
          setHand(response.data);
          if (response.data.captureType === 'full') {
            setEditState(response.data.handState as FullHandState);
          }
        } else {
          setError(t('sessions.hands.loadError'));
        }
      } catch {
        setError(t('sessions.hands.loadError'));
      } finally {
        setLoading(false);
      }
    };

    loadHand();
  }, [handId, t]);

  const handleSave = async () => {
    if (!hand || !editState) return;

    try {
      setSaving(true);
      setError(null);

      const response = await handApi.update(handId, {
        handState: editState,
        tags: hand.tags,
        note: hand.note,
        heroPlayerId: hand.heroPlayerId,
      });

      if (response.success && response.data) {
        setHand(response.data);
        if (response.data.captureType === 'full') {
          setEditState(response.data.handState as FullHandState);
        }
        setMode('review');
      } else {
        setError(t('sessions.hands.updateError'));
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t('sessions.hands.updateError')
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(t('sessions.hands.deleteConfirm'))) return;

    try {
      setSaving(true);
      const response = await handApi.delete(handId);
      if (response.success) {
        router.push(`/sessions/${sessionId}`);
      } else {
        setError(t('sessions.hands.deleteError'));
      }
    } catch {
      setError(t('sessions.hands.deleteError'));
    } finally {
      setSaving(false);
    }
  };

  const renderSnapshot = (state: SnapshotHandState) => (
    <div className="space-y-6">
      <div>
        <p className="mb-2 text-sm font-medium text-gray-700">
          {t('sessions.hands.heroCards')}
        </p>
        <div className="flex gap-2">
          {state.heroCards.map((card) => (
            <span
              key={card}
              className={`rounded border px-3 py-2 font-semibold ${
                cardSuitColor(card) === 'red' ? 'text-red-600' : 'text-gray-900'
              }`}
            >
              {formatCard(card)}
            </span>
          ))}
        </div>
      </div>
      <StreetBoard board={state.board} label={t('sessions.hands.board')} />
      {state.villainName && (
        <p className="text-sm text-gray-700">
          {t('sessions.hands.villainName')}: {state.villainName}
        </p>
      )}
      <p className="text-sm text-gray-700">
        {t('sessions.hands.pot')}: {state.pot} {hand?.currency}
      </p>
      <p className="text-sm text-gray-700">
        {t('sessions.hands.outcome')}:{' '}
        {t(`sessions.hands.outcomes.${state.outcome}`)}
      </p>
    </div>
  );

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
          {loading ? (
            <LoadingSpinner />
          ) : error && !hand ? (
            <ErrorMessage message={error} />
          ) : hand ? (
            <>
              <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
                <div>
                  <button
                    type="button"
                    onClick={() => router.push(`/sessions/${sessionId}`)}
                    className="mb-2 text-sm text-blue-600 hover:text-blue-800"
                  >
                    ← {t('sessions.backToSession')}
                  </button>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {hand.captureType === 'snapshot'
                      ? t('sessions.hands.snapshotHand')
                      : t('sessions.hands.fullHand')}
                  </h1>
                  {hand.note && (
                    <p className="mt-2 text-gray-600">{hand.note}</p>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {hand.captureType === 'full' && (
                    <button
                      type="button"
                      onClick={() =>
                        setMode((m) => (m === 'review' ? 'edit' : 'review'))
                      }
                      className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      {mode === 'review'
                        ? t('sessions.hands.edit')
                        : t('sessions.hands.review')}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={saving}
                    className="rounded-md border border-red-300 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
                  >
                    {t('sessions.hands.delete')}
                  </button>
                </div>
              </div>

              {error && (
                <div className="mb-4 rounded-md bg-red-50 p-4 text-sm text-red-700">
                  {error}
                </div>
              )}

              <div className="rounded-lg bg-white p-6 shadow">
                {hand.captureType === 'snapshot' ? (
                  renderSnapshot(hand.handState as SnapshotHandState)
                ) : editState ? (
                  <HandReplayer
                    mode={mode}
                    handState={editState}
                    onChange={mode === 'edit' ? setEditState : undefined}
                    currency={hand.currency}
                  />
                ) : null}
              </div>

              {mode === 'edit' && hand.captureType === 'full' && (
                <div className="mt-6 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setEditState(hand.handState as FullHandState);
                      setMode('review');
                    }}
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
              )}
            </>
          ) : null}
        </main>
      </div>
    </ProtectedRoute>
  );
}
