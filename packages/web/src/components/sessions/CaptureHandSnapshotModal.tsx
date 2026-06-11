'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CardPicker } from '@/components/hands/CardPicker';
import { createEmptySnapshotState } from '@/lib/cards';
import type { HandOutcome, SnapshotHandState } from '@/types';

const OUTCOMES: HandOutcome[] = ['won', 'lost', 'split'];

const TAG_OPTIONS = ['bad_beat', 'bluff', 'big_pot', 'cooler', 'funny'];

interface CaptureHandSnapshotModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (
    handState: SnapshotHandState,
    tags: string[],
    note?: string
  ) => Promise<void>;
  loading: boolean;
}

export function CaptureHandSnapshotModal({
  isOpen,
  onClose,
  onCapture,
  loading,
}: CaptureHandSnapshotModalProps) {
  const { t } = useTranslation();
  const [handState, setHandState] = useState<SnapshotHandState>(
    createEmptySnapshotState()
  );
  const [tags, setTags] = useState<string[]>([]);
  const [note, setNote] = useState('');
  const [villainName, setVillainName] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onCapture(
      {
        ...handState,
        villainName: villainName || undefined,
      },
      tags,
      note || undefined
    );
    setHandState(createEmptySnapshotState());
    setTags([]);
    setNote('');
    setVillainName('');
  };

  const handleClose = () => {
    if (loading) return;
    setHandState(createEmptySnapshotState());
    setTags([]);
    setNote('');
    setVillainName('');
    onClose();
  };

  const toggleTag = (tag: string) => {
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={handleClose}
        aria-hidden
      />
      <div className="relative z-10 mx-4 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg bg-white shadow-xl">
        <form onSubmit={handleSubmit}>
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900">
              {t('sessions.hands.quickCapture')}
            </h2>

            <div className="mt-4 space-y-4">
              <CardPicker
                label={t('sessions.hands.heroCards')}
                selected={handState.heroCards}
                onChange={(heroCards) =>
                  setHandState({ ...handState, heroCards })
                }
                maxCards={2}
              />

              <CardPicker
                label={t('sessions.hands.board')}
                selected={handState.board}
                onChange={(board) => setHandState({ ...handState, board })}
                maxCards={5}
              />

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  {t('sessions.hands.villainName')}
                </label>
                <input
                  type="text"
                  value={villainName}
                  onChange={(e) => setVillainName(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  {t('sessions.hands.pot')}
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  value={handState.pot || ''}
                  onChange={(e) =>
                    setHandState({
                      ...handState,
                      pot: Number(e.target.value) || 0,
                    })
                  }
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  {t('sessions.hands.outcome')}
                </label>
                <select
                  value={handState.outcome}
                  onChange={(e) =>
                    setHandState({
                      ...handState,
                      outcome: e.target.value as HandOutcome,
                    })
                  }
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                >
                  {OUTCOMES.map((outcome) => (
                    <option key={outcome} value={outcome}>
                      {t(`sessions.hands.outcomes.${outcome}`)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  {t('sessions.hands.netResultOptional')}
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={handState.netResult ?? ''}
                  onChange={(e) =>
                    setHandState({
                      ...handState,
                      netResult:
                        e.target.value === ''
                          ? undefined
                          : Number(e.target.value),
                    })
                  }
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                />
              </div>

              <div>
                <p className="mb-2 text-sm font-medium text-gray-700">
                  {t('sessions.hands.tagsLabel')}
                </p>
                <div className="flex flex-wrap gap-2">
                  {TAG_OPTIONS.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        tags.includes(tag)
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {t(`sessions.hands.tags.${tag}`)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  {t('sessions.hands.noteOptional')}
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={3}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-gray-200 px-6 py-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              disabled={loading || handState.heroCards.length === 0}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? t('common.loading') : t('sessions.hands.saveHand')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
