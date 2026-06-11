'use client';

import { formatCard, cardSuitColor } from '@/lib/cards';

interface StreetBoardProps {
  board: string[];
  label?: string;
}

export function StreetBoard({ board, label }: StreetBoardProps) {
  return (
    <div>
      {label && (
        <p className="mb-2 text-sm font-medium text-gray-700">{label}</p>
      )}
      <div className="flex min-h-[2.5rem] gap-2">
        {board.length === 0 ? (
          <span className="text-sm text-gray-400">—</span>
        ) : (
          board.map((card) => (
            <span
              key={card}
              className={`rounded border bg-white px-3 py-2 text-base font-semibold shadow-sm ${
                cardSuitColor(card) === 'red' ? 'text-red-600' : 'text-gray-900'
              }`}
            >
              {formatCard(card)}
            </span>
          ))
        )}
      </div>
    </div>
  );
}
