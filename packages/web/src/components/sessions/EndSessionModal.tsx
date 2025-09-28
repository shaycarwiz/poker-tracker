'use client';

import { useState, useEffect } from 'react';
import { useCurrencyPreferenceWithUtils } from '@/hooks/useCurrencyPreference';
import { SUPPORTED_CURRENCIES } from '@/lib/currency';
import type { Session } from '@/types';

interface EndSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEndSession: (
    finalCashOut: { amount: number; currency: string },
    notes?: string
  ) => Promise<void>;
  loading: boolean;
  session: Session;
}

export function EndSessionModal({
  isOpen,
  onClose,
  onEndSession,
  loading,
  session,
}: EndSessionModalProps) {
  const { defaultCurrency, supportedCurrencies } =
    useCurrencyPreferenceWithUtils();
  const [formData, setFormData] = useState({
    finalCashOut: '',
    currency: session.initialBuyIn.currency || defaultCurrency,
    notes: '',
  });

  // Update form data when default currency changes (only if no session currency)
  useEffect(() => {
    if (!session.initialBuyIn.currency) {
      setFormData((prev) => ({
        ...prev,
        currency: defaultCurrency,
      }));
    }
  }, [defaultCurrency, session.initialBuyIn.currency]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.finalCashOut || parseFloat(formData.finalCashOut) < 0) {
      return;
    }

    await onEndSession(
      {
        amount: parseFloat(formData.finalCashOut),
        currency: formData.currency,
      },
      formData.notes || undefined
    );

    // Reset form
    setFormData({
      finalCashOut: '',
      currency: session.initialBuyIn.currency || defaultCurrency,
      notes: '',
    });
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({
        finalCashOut: '',
        currency: session.initialBuyIn.currency || defaultCurrency,
        notes: '',
      });
      onClose();
    }
  };

  // Calculate current profit/loss
  const currentCashOut = session.currentCashOut?.amount || 0;
  const totalBuyIn = session.transactions
    .filter((t) => t.type === 'buy_in' || t.type === 'rebuy')
    .reduce((sum, t) => sum + t.amount.amount, 0);
  const currentProfitLoss = currentCashOut - totalBuyIn;

  if (!isOpen) return null;

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
                    End Session
                  </h3>

                  <div className="mt-4 rounded-md bg-gray-50 p-4">
                    <h4 className="text-sm font-medium text-gray-700">
                      Session Summary
                    </h4>
                    <div className="mt-2 space-y-1 text-sm text-gray-600">
                      <div className="flex justify-between">
                        <span>Total Buy-ins:</span>
                        <span>
                          ${totalBuyIn.toFixed(2)}{' '}
                          {session.initialBuyIn.currency}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Current Cash-out:</span>
                        <span>
                          ${currentCashOut.toFixed(2)}{' '}
                          {session.initialBuyIn.currency}
                        </span>
                      </div>
                      <div className="flex justify-between font-medium">
                        <span>Current P&L:</span>
                        <span
                          className={
                            currentProfitLoss >= 0
                              ? 'text-green-600'
                              : 'text-red-600'
                          }
                        >
                          ${currentProfitLoss.toFixed(2)}{' '}
                          {session.initialBuyIn.currency}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 space-y-4">
                    <div>
                      <label
                        htmlFor="finalCashOut"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Final Cash-out Amount
                      </label>
                      <div className="mt-1 flex rounded-md shadow-sm">
                        <span className="inline-flex items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-50 px-3 text-sm text-gray-500">
                          $
                        </span>
                        <input
                          type="number"
                          id="finalCashOut"
                          step="0.01"
                          min="0"
                          value={formData.finalCashOut}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              finalCashOut: e.target.value,
                            })
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
                        Currency
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
                        htmlFor="notes"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Session Notes (Optional)
                      </label>
                      <textarea
                        id="notes"
                        rows={3}
                        value={formData.notes}
                        onChange={(e) =>
                          setFormData({ ...formData, notes: e.target.value })
                        }
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        placeholder="Add any notes about the session..."
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
                  !formData.finalCashOut ||
                  parseFloat(formData.finalCashOut) < 0
                }
                className="inline-flex w-full justify-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 sm:ml-3 sm:w-auto sm:text-sm"
              >
                {loading ? 'Ending...' : 'End Session'}
              </button>
              <button
                type="button"
                onClick={handleClose}
                disabled={loading}
                className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 sm:ml-3 sm:mt-0 sm:w-auto sm:text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
