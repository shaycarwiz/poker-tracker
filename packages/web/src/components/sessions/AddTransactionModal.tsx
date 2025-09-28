'use client';

import { useState, useEffect } from 'react';
import { useCurrencyPreferenceWithUtils } from '@/hooks/useCurrencyPreference';
import { SUPPORTED_CURRENCIES } from '@/lib/currency';

const TRANSACTION_TYPES = [
  { value: 'buy_in', label: 'Buy In' },
  { value: 'rebuy', label: 'Rebuy' },
  { value: 'add_on', label: 'Add On' },
  { value: 'cash_out', label: 'Cash Out' },
  { value: 'tip', label: 'Tip' },
  { value: 'rakeback', label: 'Rakeback' },
  { value: 'bonus', label: 'Bonus' },
  { value: 'other', label: 'Other' },
];

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTransaction: (
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
  const { defaultCurrency, supportedCurrencies } =
    useCurrencyPreferenceWithUtils();
  const [formData, setFormData] = useState({
    type: 'buy_in',
    amount: '',
    currency: defaultCurrency,
    description: '',
  });

  // Update form data when default currency changes
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

    await onAddTransaction(
      formData.type,
      {
        amount: parseFloat(formData.amount),
        currency: formData.currency,
      },
      formData.description || undefined
    );

    // Reset form
    setFormData({
      type: 'buy_in',
      amount: '',
      currency: defaultCurrency,
      description: '',
    });
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({
        type: 'buy_in',
        amount: '',
        currency: defaultCurrency,
        description: '',
      });
      onClose();
    }
  };

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
                    Add Transaction
                  </h3>
                  <div className="mt-4 space-y-4">
                    <div>
                      <label
                        htmlFor="type"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Transaction Type
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
                        {TRANSACTION_TYPES.map((type) => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="amount"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Amount
                      </label>
                      <div className="mt-1 flex rounded-md shadow-sm">
                        <span className="inline-flex items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-50 px-3 text-sm text-gray-500">
                          $
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
                        htmlFor="description"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Description (Optional)
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
                        placeholder="Transaction description"
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
                {loading ? 'Adding...' : 'Add Transaction'}
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
