'use client';

import { Header } from '@/components/Header';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { CreateSessionForm } from '@/components/dashboard/CreateSessionForm';

export default function NewSessionPage() {
  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-gray-50">
        <Header />
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <CreateSessionForm />
        </div>
      </main>
    </ProtectedRoute>
  );
}
