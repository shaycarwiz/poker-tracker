'use client';

import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import type { HandSummary } from '@/types';
import { useCurrencyFormatting } from '@/lib/currency';

interface HandSummaryCardProps {
  hand: HandSummary;
  sessionId: string;
  currency?: string;
}

export function HandSummaryCard({
  hand,
  sessionId,
  currency,
}: HandSummaryCardProps) {
  const { t } = useTranslation();
  const { formatCurrency } = useCurrencyFormatting(currency || hand.currency);

  return (
    <Link
      href={`/sessions/${sessionId}/hands/${hand.handId}`}
      className="block rounded-lg border border-gray-200 bg-gray-50 p-4 transition hover:border-blue-300 hover:bg-blue-50"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-medium text-gray-900">
            {hand.captureType === 'snapshot'
              ? t('sessions.hands.snapshotHand')
              : t('sessions.hands.fullHand')}
          </p>
          {hand.note && (
            <p className="mt-1 text-sm text-gray-600 line-clamp-2">{hand.note}</p>
          )}
          {hand.tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {hand.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-800"
                >
                  {t(`sessions.hands.tags.${tag}`, tag)}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="text-right text-sm">
          {hand.potAmount !== undefined && (
            <p className="text-gray-600">
              {t('sessions.hands.pot')}: {formatCurrency(hand.potAmount, hand.currency)}
            </p>
          )}
          {hand.netResult !== undefined && (
            <p
              className={
                hand.netResult >= 0 ? 'text-green-600' : 'text-red-600'
              }
            >
              {hand.netResult >= 0 ? '+' : ''}
              {formatCurrency(hand.netResult, hand.currency)}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
