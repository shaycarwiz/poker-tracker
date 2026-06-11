'use client';

import { useTranslation } from 'react-i18next';
import type { HandActionType } from '@/types';

const ACTION_TYPES: HandActionType[] = [
  'fold',
  'check',
  'call',
  'bet',
  'raise',
  'all_in',
];

const ACTION_KEYS: Record<HandActionType, string> = {
  fold: 'fold',
  check: 'check',
  call: 'call',
  bet: 'bet',
  raise: 'raise',
  all_in: 'allIn',
};

interface ActionBarProps {
  onSelect: (type: HandActionType) => void;
  disabled?: boolean;
}

export function ActionBar({ onSelect, disabled = false }: ActionBarProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-wrap gap-2">
      {ACTION_TYPES.map((type) => (
        <button
          key={type}
          type="button"
          disabled={disabled}
          onClick={() => onSelect(type)}
          className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          {t(`sessions.hands.actions.${ACTION_KEYS[type]}`)}
        </button>
      ))}
    </div>
  );
}
