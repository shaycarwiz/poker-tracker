'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { handApi, sessionApi } from '@/lib/api-client';
import type { Session, SnapshotHandState } from '@/types';
import { CaptureHandSnapshotModal } from './CaptureHandSnapshotModal';

interface SessionHandActionsProps {
  session: Session;
  onSessionUpdate: (updatedSession: Session) => void;
}

export function SessionHandActions({
  session,
  onSessionUpdate,
}: SessionHandActionsProps) {
  const { t } = useTranslation();
  const [showSnapshotModal, setShowSnapshotModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const status = session.status.toUpperCase();
  const canCaptureHand = status === 'ACTIVE' || status === 'COMPLETED';

  if (!canCaptureHand) {
    return null;
  }

  const refreshSession = async () => {
    const updatedResponse = await sessionApi.getById(session.sessionId);
    if (updatedResponse.success) {
      onSessionUpdate(updatedResponse.data);
    }
  };

  const handleCaptureSnapshot = async (
    handState: SnapshotHandState,
    tags: string[],
    note?: string
  ) => {
    try {
      setLoading(true);
      setError(null);

      const response = await handApi.create(session.sessionId, {
        captureType: 'snapshot',
        handState,
        tags,
        note,
      });

      if (response.success) {
        await refreshSession();
        setShowSnapshotModal(false);
      } else {
        setError(t('sessions.hands.captureError'));
      }
    } catch (err) {
      console.error('Error capturing hand:', err);
      setError(
        err instanceof Error ? err.message : t('sessions.hands.captureError')
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="rounded-lg bg-white p-6 shadow">
        <h3 className="mb-4 text-lg font-medium text-gray-900">
          {t('sessions.hands.title')}
        </h3>

        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setShowSnapshotModal(true)}
            disabled={loading}
            className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {t('sessions.hands.quickCapture')}
          </button>
          <Link
            href={`/sessions/${session.sessionId}/hands/new`}
            className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            {t('sessions.hands.buildFullHand')}
          </Link>
        </div>
      </div>

      <CaptureHandSnapshotModal
        isOpen={showSnapshotModal}
        onClose={() => setShowSnapshotModal(false)}
        onCapture={handleCaptureSnapshot}
        loading={loading}
      />
    </>
  );
}
