'use client';

import { ALL_CARDS, cardSuitColor, formatCard } from '@/lib/cards';

interface CardPickerProps {
  selected: string[];
  onChange: (cards: string[]) => void;
  maxCards?: number;
  label?: string;
  disabled?: boolean;
}

export function CardPicker({
  selected,
  onChange,
  maxCards = 2,
  label,
  disabled = false,
}: CardPickerProps) {
  const toggleCard = (card: string) => {
    if (disabled) return;

    if (selected.includes(card)) {
      onChange(selected.filter((c) => c !== card));
      return;
    }

    if (selected.length >= maxCards) {
      onChange([...selected.slice(1), card]);
      return;
    }

    onChange([...selected, card]);
  };

  return (
    <div>
      {label && (
        <label className="mb-2 block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <div className="mb-2 flex min-h-[2rem] gap-2">
        {selected.length === 0 ? (
          <span className="text-sm text-gray-400">—</span>
        ) : (
          selected.map((card) => (
            <span
              key={card}
              className={`rounded border px-2 py-1 text-sm font-semibold ${
                cardSuitColor(card) === 'red' ? 'text-red-600' : 'text-gray-900'
              }`}
            >
              {formatCard(card)}
            </span>
          ))
        )}
      </div>
      <div className="grid max-h-40 grid-cols-7 gap-1 overflow-y-auto rounded border border-gray-200 p-2 sm:grid-cols-13">
        {ALL_CARDS.map((card) => {
          const isSelected = selected.includes(card);
          return (
            <button
              key={card}
              type="button"
              disabled={disabled}
              onClick={() => toggleCard(card)}
              className={`rounded px-1 py-0.5 text-xs font-medium ${
                isSelected
                  ? 'bg-blue-600 text-white'
                  : cardSuitColor(card) === 'red'
                    ? 'text-red-600 hover:bg-red-50'
                    : 'text-gray-900 hover:bg-gray-100'
              }`}
            >
              {formatCard(card)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
