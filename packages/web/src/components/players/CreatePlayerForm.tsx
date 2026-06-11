'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { playerApi } from '@/lib/api-client';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCurrencyPreferenceWithUtils } from '@/hooks/useCurrencyPreference';

interface FormData {
  name: string;
  email: string;
  initialBankroll: string;
  currency: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function CreatePlayerForm() {
  const { data: session } = useSession();
  const router = useRouter();
  const { t } = useTranslation();
  const { language } = useLanguage();
  const { handleError, handleApiError } = useErrorHandler(language);
  const { defaultCurrency, supportedCurrencies } =
    useCurrencyPreferenceWithUtils();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    initialBankroll: '',
    currency: defaultCurrency,
  });

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      currency: defaultCurrency,
    }));
  }, [defaultCurrency]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = (): string | null => {
    if (!formData.name.trim()) {
      return t('forms.validation.required');
    }
    if (formData.email.trim() && !EMAIL_REGEX.test(formData.email.trim())) {
      return t('forms.validation.email');
    }
    if (
      formData.initialBankroll &&
      (isNaN(Number(formData.initialBankroll)) ||
        Number(formData.initialBankroll) < 0)
    ) {
      return t('forms.validation.number');
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

    if (!session?.backendToken || !session?.userId) {
      setError('User not authenticated');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const bankrollAmount = formData.initialBankroll
        ? Number(formData.initialBankroll)
        : 0;

      const response = await playerApi.create({
        name: formData.name.trim(),
        email: formData.email.trim() || undefined,
        initialBankroll: {
          amount: bankrollAmount,
          currency: formData.currency,
        },
      });

      if (response.success) {
        router.push('/players');
      } else {
        setError(handleApiError(response));
      }
    } catch (err) {
      console.error('Error creating player:', err);
      setError(handleError(err));
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
              {t('players.createPlayer')}
            </h2>
            <p className="mt-2 text-gray-600">
              {t('players.createPlayerDescription')}
            </p>
          </div>

          {error && (
            <div className="mb-6">
              <ErrorMessage message={error} />
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                {t('players.name')} *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder={t('players.namePlaceholder')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                required
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                {t('players.email')} ({t('common.optional')})
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder={t('players.emailPlaceholder')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="currency"
                  className="block text-sm font-medium text-gray-700"
                >
                  {t('players.currency')}
                </label>
                <select
                  id="currency"
                  name="currency"
                  value={formData.currency}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
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
                  htmlFor="initialBankroll"
                  className="block text-sm font-medium text-gray-700"
                >
                  {t('players.initialBankroll')} ({t('common.optional')})
                </label>
                <input
                  type="number"
                  id="initialBankroll"
                  name="initialBankroll"
                  value={formData.initialBankroll}
                  onChange={handleInputChange}
                  placeholder="0"
                  min="0"
                  step="0.01"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={loading}
              >
                {t('common.cancel')}
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {loading ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    {t('players.creatingPlayer')}
                  </>
                ) : (
                  t('players.createPlayer')
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
