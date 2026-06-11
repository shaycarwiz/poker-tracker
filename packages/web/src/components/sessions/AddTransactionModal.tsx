'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useTranslation } from 'react-i18next';
import { useCurrencyPreferenceWithUtils } from '@/hooks/useCurrencyPreference';
import { getCurrencySymbol } from '@/lib/currency';
import { playerApi } from '@/lib/api-client';
import type { Player } from '@/types';

const TRANSACTION_TYPE_VALUES = [
  'buy_in',
  'rebuy',
  'add_on',
  'cash_out',
  'tip',
  'rakeback',
  'bonus',
  'other',
] as const;

const TRANSACTION_TYPE_KEYS: Record<string, string> = {
  buy_in: 'buyIn',
  rebuy: 'rebuy',
  add_on: 'addOn',
  cash_out: 'cashOut',
  tip: 'tip',
  rakeback: 'rakeback',
  bonus: 'bonus',
  other: 'other',
};

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTransaction: (
    playerId: string,
    type: string,
    amount: { amount: number; currency: string },
    description?: string
  ) => Promise<void>;
  loading: boolean;
}

export function AddTransactionModal({
  isOpen,
  onClose,
  onAddTransaction,
  loading,
}: AddTransactionModalProps) {
  const { t } = useTranslation();
  const { data: session } = useSession();
  const { defaultCurrency, supportedCurrencies } =
    useCurrencyPreferenceWithUtils();
  const [players, setPlayers] = useState<Player[]>([]);
  const [formData, setFormData] = useState({
    playerId: '',
    type: 'buy_in',
    amount: '',
    currency: defaultCurrency,
    description: '',
  });

  useEffect(() => {
    const loadPlayers = async () => {
      if (!session?.backendToken) return;
      const response = await playerApi.list();
      if (response.success && response.data?.players) {
        setPlayers(response.data.players);
        const defaultId =
          session.defaultPlayerId || response.data.players[0]?.id || '';
        setFormData((prev) => ({
          ...prev,
          playerId: prev.playerId || defaultId,
        }));
      }
    };
    loadPlayers();
  }, [session?.backendToken, session?.defaultPlayerId]);

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      currency: defaultCurrency,
    }));
  }, [defaultCurrency]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      return;
    }

    if (!formData.playerId) return;

    await onAddTransaction(
      formData.playerId,
      formData.type,
      {
        amount: parseFloat(formData.amount),
        currency: formData.currency,
      },
      formData.description || undefined
    );

    setFormData({
      playerId: formData.playerId,
      type: 'buy_in',
      amount: '',
      currency: defaultCurrency,
      description: '',
    });
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({
        playerId: session?.defaultPlayerId || '',
        type: 'buy_in',
        amount: '',
        currency: defaultCurrency,
        description: '',
      });
      onClose();
    }
  };

  if (!isOpen) return null;

  const currencySymbol = getCurrencySymbol(formData.currency);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-end justify-center px-4 pb-20 pt-4 text-center sm:block sm:p-0">
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={handleClose}
        />

        <span className="hidden sm:inline-block sm:h-screen sm:align-middle">
          &#8203;
        </span>

        <div className="inline-block transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:align-middle">
          <form onSubmit={handleSubmit}>
            <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
              <div className="sm:flex sm:items-start">
                <div className="w-full">
                  <h3 className="text-lg font-medium leading-6 text-gray-900">
                    {t('sessions.addTransaction')}
                  </h3>
                  <div className="mt-4 space-y-4">
                    <div>
                      <label
                        htmlFor="playerId"
                        className="block text-sm font-medium text-gray-700"
                      >
                        {t('sessions.player')}
                      </label>
                      <select
                        id="playerId"
                        value={formData.playerId}
                        onChange={(e) =>
                          setFormData({ ...formData, playerId: e.target.value })
                        }
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        disabled={loading}
                        required
                      >
                        {players.map((player) => (
                          <option key={player.id} value={player.id}>
                            {player.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="type"
                        className="block text-sm font-medium text-gray-700"
                      >
                        {t('sessions.transactionType')}
                      </label>
                      <select
                        id="type"
                        value={formData.type}
                        onChange={(e) =>
                          setFormData({ ...formData, type: e.target.value })
                        }
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        disabled={loading}
                      >
                        {TRANSACTION_TYPE_VALUES.map((type) => (
                          <option key={type} value={type}>
                            {t(
                              `sessions.transactionTypes.${TRANSACTION_TYPE_KEYS[type]}`
                            )}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="amount"
                        className="block text-sm font-medium text-gray-700"
                      >
                        {t('sessions.amount')}
                      </label>
                      <div className="mt-1 flex rounded-md shadow-sm">
                        <span className="inline-flex items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-50 px-3 text-sm text-gray-500">
                          {currencySymbol}
                        </span>
                        <input
                          type="number"
                          id="amount"
                          step="0.01"
                          min="0"
                          value={formData.amount}
                          onChange={(e) =>
                            setFormData({ ...formData, amount: e.target.value })
                          }
                          className="block w-full flex-1 rounded-none rounded-r-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                          placeholder="0.00"
                          disabled={loading}
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="currency"
                        className="block text-sm font-medium text-gray-700"
                      >
                        {t('sessions.currency')}
                      </label>
                      <select
                        id="currency"
                        value={formData.currency}
                        onChange={(e) =>
                          setFormData({ ...formData, currency: e.target.value })
                        }
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        disabled={loading}
                      >
                        {supportedCurrencies.map((currency) => (
                          <option key={currency} value={currency}>
                            {currency}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="description"
                        className="block text-sm font-medium text-gray-700"
                      >
                        {t('sessions.descriptionOptional')}
                      </label>
                      <input
                        type="text"
                        id="description"
                        value={formData.description}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            description: e.target.value,
                          })
                        }
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        placeholder={t(
                          'sessions.transactionDescriptionPlaceholder'
                        )}
                        disabled={loading}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
              <button
                type="submit"
                disabled={
                  loading ||
                  !formData.amount ||
                  parseFloat(formData.amount) <= 0
                }
                className="inline-flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 sm:ml-3 sm:w-auto sm:text-sm"
              >
                {loading
                  ? t('sessions.addingTransaction')
                  : t('sessions.addTransaction')}
              </button>
              <button
                type="button"
                onClick={handleClose}
                disabled={loading}
                className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 sm:ml-3 sm:mt-0 sm:w-auto sm:text-sm"
              >
                {t('common.cancel')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
