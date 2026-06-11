'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { sessionApi } from '@/lib/api-client';
import type { Session } from '@/types';
import { AddTransactionModal } from './AddTransactionModal';
import { EndSessionModal } from './EndSessionModal';
import { UpdateNotesModal } from './UpdateNotesModal';

interface SessionActionsProps {
  session: Session;
  onSessionUpdate: (updatedSession: Session) => void;
}

export function SessionActions({
  session,
  onSessionUpdate,
}: SessionActionsProps) {
  const { t } = useTranslation();
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [showEndSession, setShowEndSession] = useState(false);
  const [showUpdateNotes, setShowUpdateNotes] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isActive = session.status.toUpperCase() === 'ACTIVE';

  const getStatusLabel = (status: string) => {
    switch (status.toUpperCase()) {
      case 'ACTIVE':
        return t('sessions.status.active');
      case 'COMPLETED':
        return t('sessions.status.completed');
      case 'CANCELLED':
        return t('sessions.status.cancelled');
      default:
        return status;
    }
  };

  const handleAddTransaction = async (
    playerId: string,
    type: string,
    amount: { amount: number; currency: string },
    description?: string
  ) => {
    try {
      setLoading(true);
      setError(null);

      const response = await sessionApi.addTransaction(
        session.sessionId,
        playerId,
        type,
        amount,
        description
      );

      if (response.success) {
        const updatedResponse = await sessionApi.getById(session.sessionId);
        if (updatedResponse.success) {
          onSessionUpdate(updatedResponse.data);
        }
        setShowAddTransaction(false);
      } else {
        setError(t('sessions.addTransactionError'));
      }
    } catch (err) {
      console.error('Error adding transaction:', err);
      setError(
        err instanceof Error ? err.message : t('sessions.addTransactionError')
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEndSession = async (
    finalCashOut: { amount: number; currency: string },
    notes?: string
  ) => {
    try {
      setLoading(true);
      setError(null);

      const response = await sessionApi.end(
        session.sessionId,
        finalCashOut,
        notes
      );

      if (response.success) {
        const updatedResponse = await sessionApi.getById(session.sessionId);
        if (updatedResponse.success) {
          onSessionUpdate(updatedResponse.data);
        }
        setShowEndSession(false);
      } else {
        setError(t('sessions.endSessionError'));
      }
    } catch (err) {
      console.error('Error ending session:', err);
      setError(err instanceof Error ? err.message : t('sessions.endSessionError'));
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateNotes = async (notes: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await sessionApi.updateNotes(session.sessionId, notes);

      if (response.success) {
        const updatedResponse = await sessionApi.getById(session.sessionId);
        if (updatedResponse.success) {
          onSessionUpdate(updatedResponse.data);
        }
        setShowUpdateNotes(false);
      } else {
        setError(t('sessions.updateNotesError'));
      }
    } catch (err) {
      console.error('Error updating notes:', err);
      setError(
        err instanceof Error ? err.message : t('sessions.updateNotesError')
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isActive) {
    return (
      <div className="rounded-lg bg-gray-50 p-4">
        <p className="text-sm text-gray-600">
          {t('sessions.inactiveSession', {
            status: getStatusLabel(session.status),
          })}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-lg bg-white p-6 shadow">
        <h3 className="mb-4 text-lg font-medium text-gray-900">
          {t('sessions.sessionActions')}
        </h3>

        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-4">
            <div className="text-sm text-red-700">{error}</div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <button
            onClick={() => setShowAddTransaction(true)}
            disabled={loading}
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {t('sessions.addTransaction')}
          </button>

          <button
            onClick={() => setShowEndSession(true)}
            disabled={loading}
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {t('sessions.endSession')}
          </button>

          <button
            onClick={() => setShowUpdateNotes(true)}
            disabled={loading}
            className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {t('sessions.updateNotes')}
          </button>
        </div>
      </div>

      <AddTransactionModal
        isOpen={showAddTransaction}
        onClose={() => setShowAddTransaction(false)}
        onAddTransaction={handleAddTransaction}
        loading={loading}
      />

      <EndSessionModal
        isOpen={showEndSession}
        onClose={() => setShowEndSession(false)}
        onEndSession={handleEndSession}
        loading={loading}
        session={session}
      />

      <UpdateNotesModal
        isOpen={showUpdateNotes}
        onClose={() => setShowUpdateNotes(false)}
        onUpdateNotes={handleUpdateNotes}
        loading={loading}
        currentNotes={session.notes || ''}
      />
    </>
  );
}
