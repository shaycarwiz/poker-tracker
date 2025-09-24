'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { sessionApi } from '@/lib/api-client';
import type { StartSessionRequest } from '@/types';

interface FormData {
  location: string;
  smallBlind: string;
  bigBlind: string;
  currency: string;
  initialBuyIn: string;
  notes: string;
}

const CURRENCIES = ['USD', 'EUR', 'GBP', 'CAD', 'AUD'];

export function CreateSessionForm() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    location: '',
    smallBlind: '',
    bigBlind: '',
    currency: 'USD',
    initialBuyIn: '',
    notes: '',
  });

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = (): string | null => {
    if (!formData.location.trim()) {
      return 'Location is required';
    }
    if (
      !formData.smallBlind ||
      isNaN(Number(formData.smallBlind)) ||
      Number(formData.smallBlind) <= 0
    ) {
      return 'Small blind must be a positive number';
    }
    if (
      !formData.bigBlind ||
      isNaN(Number(formData.bigBlind)) ||
      Number(formData.bigBlind) <= 0
    ) {
      return 'Big blind must be a positive number';
    }
    if (Number(formData.bigBlind) <= Number(formData.smallBlind)) {
      return 'Big blind must be greater than small blind';
    }
    if (
      !formData.initialBuyIn ||
      isNaN(Number(formData.initialBuyIn)) ||
      Number(formData.initialBuyIn) <= 0
    ) {
      return 'Initial buy-in must be a positive number';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    if (!session?.user?.id) {
      setError('User not authenticated');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const sessionData: StartSessionRequest = {
        playerId: session.user.id,
        location: formData.location.trim(),
        stakes: {
          smallBlind: Number(formData.smallBlind),
          bigBlind: Number(formData.bigBlind),
          currency: formData.currency,
        },
        initialBuyIn: {
          amount: Number(formData.initialBuyIn),
          currency: formData.currency,
        },
        notes: formData.notes.trim() || undefined,
      };

      const response = await sessionApi.start(sessionData);

      if (response.success) {
        router.push(`/sessions/${response.data.sessionId}`);
      } else {
        setError('Failed to start session');
      }
    } catch (err) {
      console.error('Error starting session:', err);
      setError(err instanceof Error ? err.message : 'Failed to start session');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <div className="rounded-lg bg-white shadow">
        <div className="px-4 py-5 sm:p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Start New Session
            </h2>
            <p className="mt-2 text-gray-600">
              Enter the details for your new poker session
            </p>
          </div>

          {error && (
            <div className="mb-6">
              <ErrorMessage message={error} />
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Location */}
            <div>
              <label
                htmlFor="location"
                className="block text-sm font-medium text-gray-700"
              >
                Location *
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="e.g., Casino Royale, Home Game, Online"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                required
              />
            </div>

            {/* Stakes */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="smallBlind"
                  className="block text-sm font-medium text-gray-700"
                >
                  Small Blind *
                </label>
                <input
                  type="number"
                  id="smallBlind"
                  name="smallBlind"
                  value={formData.smallBlind}
                  onChange={handleInputChange}
                  placeholder="1"
                  min="0"
                  step="0.01"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="bigBlind"
                  className="block text-sm font-medium text-gray-700"
                >
                  Big Blind *
                </label>
                <input
                  type="number"
                  id="bigBlind"
                  name="bigBlind"
                  value={formData.bigBlind}
                  onChange={handleInputChange}
                  placeholder="2"
                  min="0"
                  step="0.01"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  required
                />
              </div>
            </div>

            {/* Currency and Initial Buy-in */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="currency"
                  className="block text-sm font-medium text-gray-700"
                >
                  Currency *
                </label>
                <select
                  id="currency"
                  name="currency"
                  value={formData.currency}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  required
                >
                  {CURRENCIES.map((currency) => (
                    <option key={currency} value={currency}>
                      {currency}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  htmlFor="initialBuyIn"
                  className="block text-sm font-medium text-gray-700"
                >
                  Initial Buy-in *
                </label>
                <input
                  type="number"
                  id="initialBuyIn"
                  name="initialBuyIn"
                  value={formData.initialBuyIn}
                  onChange={handleInputChange}
                  placeholder="200"
                  min="0"
                  step="0.01"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  required
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label
                htmlFor="notes"
                className="block text-sm font-medium text-gray-700"
              >
                Notes (Optional)
              </label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={3}
                placeholder="Any additional notes about this session..."
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {loading ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Starting Session...
                  </>
                ) : (
                  'Start Session'
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
