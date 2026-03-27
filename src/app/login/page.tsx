'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        router.push('/');
        router.refresh();
      } else {
        setError('Contraseña incorrecta');
      }
    } catch {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pattern-bg">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent text-4xl shadow-lg mb-4">
            <span className="drop-shadow-md">&#127859;</span>
          </div>
          <h1 className="text-2xl font-bold text-text">Las Recetas de Vero</h1>
          <p className="text-sm text-text-muted mt-1">Nuestro recetario con mucho amor</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-bg-card rounded-2xl border border-border/60 shadow-lg p-6 space-y-4">
          <div>
            <label htmlFor="password" className="block text-xs font-medium text-text-muted mb-1.5">Contraseña</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Introduce la contraseña..."
              autoFocus
              className="w-full rounded-xl border border-border bg-bg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-sm text-danger bg-danger/5 rounded-xl px-3 py-2">
              &#9888;&#65039; {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !password}
            className="w-full rounded-xl bg-gradient-to-r from-primary to-primary-light text-white py-3 text-sm font-semibold shadow-md hover:shadow-lg hover:opacity-95 active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}
