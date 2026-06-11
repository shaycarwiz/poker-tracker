'use client';

import { Header } from '@/components/Header';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { CreatePlayerForm } from '@/components/players/CreatePlayerForm';

export default function NewPlayerPage() {
  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-gray-50">
        <Header />
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <CreatePlayerForm />
        </div>
      </main>
    </ProtectedRoute>
  );
}
