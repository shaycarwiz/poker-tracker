'use client';

import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { FullHandState, HandAction, HandActionType, HandStreet } from '@/types';
import { flattenHandActions, formatCard, cardSuitColor, getBoardUpToStep } from '@/lib/cards';
import { CardPicker } from './CardPicker';
import { ActionBar } from './ActionBar';
import { StreetBoard } from './StreetBoard';

interface HandReplayerProps {
  mode: 'edit' | 'review';
  handState: FullHandState;
  onChange?: (state: FullHandState) => void;
  currency?: string;
}

const STREET_NAMES: HandStreet['name'][] = [
  'preflop',
  'flop',
  'turn',
  'river',
];

const STREET_KEYS: Record<HandStreet['name'], string> = {
  preflop: 'preflop',
  flop: 'flop',
  turn: 'turn',
  river: 'river',
};

const ACTION_KEYS: Record<HandActionType, string> = {
  fold: 'fold',
  check: 'check',
  call: 'call',
  bet: 'bet',
  raise: 'raise',
  all_in: 'allIn',
};

export function HandReplayer({
  mode,
  handState,
  onChange,
  currency = 'USD',
}: HandReplayerProps) {
  const { t } = useTranslation();
  const [activeStreetIndex, setActiveStreetIndex] = useState(0);
  const [selectedSeat, setSelectedSeat] = useState(1);
  const [actionAmount, setActionAmount] = useState('');
  const [reviewStep, setReviewStep] = useState(0);

  const steps = useMemo(
    () => flattenHandActions(handState.streets),
    [handState.streets]
  );

  const reviewBoard = useMemo(
    () => getBoardUpToStep(handState.streets, reviewStep),
    [handState.streets, reviewStep]
  );

  const updateState = (next: FullHandState) => {
    onChange?.(next);
  };

  const updateStreet = (
    streetIndex: number,
    updater: (street: HandStreet) => HandStreet
  ) => {
    const streets = handState.streets.map((street, index) =>
      index === streetIndex ? updater(street) : street
    );
    updateState({ ...handState, streets });
  };

  const addAction = (type: HandActionType) => {
    const amount =
      type === 'bet' || type === 'raise' || type === 'call' || type === 'all_in'
        ? Number(actionAmount) || undefined
        : undefined;

    const action: HandAction = { seat: selectedSeat, type, amount };

    updateStreet(activeStreetIndex, (street) => ({
      ...street,
      actions: [...street.actions, action],
    }));
    setActionAmount('');
  };

  const removeLastAction = () => {
    updateStreet(activeStreetIndex, (street) => ({
      ...street,
      actions: street.actions.slice(0, -1),
    }));
  };

  const updatePlayerName = (seat: number, name: string) => {
    updateState({
      ...handState,
      players: handState.players.map((player) =>
        player.seat === seat ? { ...player, name } : player
      ),
    });
  };

  const updatePlayerCards = (seat: number, holeCards: string[]) => {
    updateState({
      ...handState,
      players: handState.players.map((player) =>
        player.seat === seat ? { ...player, holeCards } : player
      ),
    });
  };

  const updateStreetBoard = (streetIndex: number, board: string[]) => {
    updateStreet(streetIndex, (street) => ({ ...street, board }));
  };

  const updatePot = (pot: number) => {
    updateState({
      ...handState,
      result: { ...handState.result, pot },
    });
  };

  const getPlayerName = (seat: number) =>
    handState.players.find((p) => p.seat === seat)?.name ??
    t('sessions.hands.seat', { seat });

  const formatAction = (action: HandAction) => {
    const label = t(`sessions.hands.actions.${ACTION_KEYS[action.type]}`);
    if (action.amount !== undefined) {
      return `${getPlayerName(action.seat)}: ${label} ${action.amount} ${currency}`;
    }
    return `${getPlayerName(action.seat)}: ${label}`;
  };

  if (mode === 'review') {
    const current =
      reviewStep >= 0 && reviewStep < steps.length ? steps[reviewStep] : null;
    const currentAction =
      current &&
      handState.streets[current.streetIndex]?.actions[current.actionIndex];

    return (
      <div className="space-y-6">
        <StreetBoard
          board={reviewBoard}
          label={t('sessions.hands.board')}
        />

        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <h3 className="mb-3 text-sm font-semibold text-gray-900">
            {t('sessions.hands.actionHistory')}
          </h3>
          <div className="max-h-64 space-y-2 overflow-y-auto">
            {handState.streets.map((street, streetIndex) => (
              <div key={street.name}>
                <p className="text-xs font-semibold uppercase text-gray-500">
                  {t(`sessions.hands.streets.${STREET_KEYS[street.name]}`)}
                </p>
                {street.actions.length === 0 ? (
                  <p className="text-sm text-gray-400">—</p>
                ) : (
                  street.actions.map((action, actionIndex) => {
                    const stepIndex = steps.findIndex(
                      (s) =>
                        s.streetIndex === streetIndex &&
                        s.actionIndex === actionIndex
                    );
                    const isActive = stepIndex === reviewStep;
                    return (
                      <p
                        key={`${streetIndex}-${actionIndex}`}
                        className={`rounded px-2 py-1 text-sm ${
                          isActive ? 'bg-blue-100 font-medium text-blue-900' : 'text-gray-700'
                        }`}
                      >
                        {formatAction(action)}
                      </p>
                    );
                  })
                )}
              </div>
            ))}
          </div>
        </div>

        {currentAction && (
          <p className="rounded-md bg-blue-50 px-4 py-3 text-sm text-blue-900">
            {formatAction(currentAction)}
          </p>
        )}

        <div className="flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => setReviewStep((s) => Math.max(0, s - 1))}
            disabled={reviewStep <= 0}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm disabled:opacity-50"
          >
            {t('sessions.hands.previous')}
          </button>
          <span className="text-sm text-gray-600">
            {steps.length === 0
              ? t('sessions.hands.noActions')
              : t('sessions.hands.stepOf', {
                  current: Math.min(reviewStep + 1, steps.length),
                  total: steps.length,
                })}
          </span>
          <button
            type="button"
            onClick={() =>
              setReviewStep((s) => Math.min(steps.length - 1, s + 1))
            }
            disabled={reviewStep >= steps.length - 1}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm disabled:opacity-50"
          >
            {t('sessions.hands.next')}
          </button>
        </div>

        <div className="rounded-lg bg-gray-50 p-4 text-sm">
          <p>
            {t('sessions.hands.pot')}: {handState.result.pot} {currency}
          </p>
        </div>
      </div>
    );
  }

  const activeStreet = handState.streets[activeStreetIndex];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        {handState.players.map((player) => (
          <div
            key={player.seat}
            className="rounded-lg border border-gray-200 bg-gray-50 p-4"
          >
            <label className="mb-2 block text-sm font-medium text-gray-700">
              {t('sessions.hands.seat', { seat: player.seat })}
            </label>
            <input
              type="text"
              value={player.name}
              onChange={(e) => updatePlayerName(player.seat, e.target.value)}
              className="mb-3 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
            <CardPicker
              label={t('sessions.hands.holeCards')}
              selected={player.holeCards ?? []}
              onChange={(cards) => updatePlayerCards(player.seat, cards)}
              maxCards={2}
            />
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {STREET_NAMES.map((name, index) => (
          <button
            key={name}
            type="button"
            onClick={() => setActiveStreetIndex(index)}
            className={`rounded-md px-3 py-1.5 text-sm font-medium ${
              activeStreetIndex === index
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {t(`sessions.hands.streets.${STREET_KEYS[name]}`)}
          </button>
        ))}
      </div>

      {activeStreet.name !== 'preflop' && (
        <CardPicker
          label={t('sessions.hands.board')}
          selected={activeStreet.board}
          onChange={(board) => updateStreetBoard(activeStreetIndex, board)}
          maxCards={
            activeStreet.name === 'flop'
              ? 3
              : activeStreet.name === 'turn'
                ? 4
                : 5
          }
        />
      )}

      <div className="rounded-lg border border-gray-200 p-4">
        <h3 className="mb-3 text-sm font-semibold text-gray-900">
          {t('sessions.hands.addAction')}
        </h3>
        <div className="mb-3 flex flex-wrap items-center gap-3">
          <label className="text-sm text-gray-700">
            {t('sessions.hands.player')}
          </label>
          <select
            value={selectedSeat}
            onChange={(e) => setSelectedSeat(Number(e.target.value))}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm"
          >
            {handState.players.map((player) => (
              <option key={player.seat} value={player.seat}>
                {player.name}
              </option>
            ))}
          </select>
          <input
            type="number"
            min="0"
            step="0.01"
            value={actionAmount}
            onChange={(e) => setActionAmount(e.target.value)}
            placeholder={t('sessions.hands.amount')}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
        <ActionBar onSelect={addAction} />
        <button
          type="button"
          onClick={removeLastAction}
          disabled={activeStreet.actions.length === 0}
          className="mt-3 text-sm text-red-600 hover:text-red-800 disabled:opacity-50"
        >
          {t('sessions.hands.removeLastAction')}
        </button>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <h3 className="mb-2 text-sm font-semibold text-gray-900">
          {t(`sessions.hands.streets.${STREET_KEYS[activeStreet.name]}`)}{' '}
          {t('sessions.hands.actionsTitle')}
        </h3>
        {activeStreet.actions.length === 0 ? (
          <p className="text-sm text-gray-400">{t('sessions.hands.noActions')}</p>
        ) : (
          <ul className="space-y-1">
            {activeStreet.actions.map((action, index) => (
              <li key={index} className="text-sm text-gray-700">
                {formatAction(action)}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          {t('sessions.hands.pot')}
        </label>
        <input
          type="number"
          min="0"
          step="0.01"
          value={handState.result.pot}
          onChange={(e) => updatePot(Number(e.target.value) || 0)}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm md:w-48"
        />
      </div>

      <StreetBoard
        board={activeStreet.name === 'preflop' ? [] : activeStreet.board}
        label={t('sessions.hands.currentBoard')}
      />

      <div className="flex flex-wrap gap-2">
        {handState.players[0]?.holeCards?.map((card) => (
          <span
            key={card}
            className={`text-sm font-semibold ${
              cardSuitColor(card) === 'red' ? 'text-red-600' : 'text-gray-900'
            }`}
          >
            {formatCard(card)}
          </span>
        ))}
      </div>
    </div>
  );
}
