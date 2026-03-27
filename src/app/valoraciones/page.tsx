'use client';

import { useState, useEffect, useMemo } from 'react';
import type { Recipe, NivelGusto } from '../_lib/types';
import RecipeCard from '../_components/RecipeCard';

type ViewMode = 'top-ambos' | 'top-ivan' | 'top-vero' | 'coinciden';

const ratingOrder: Record<string, number> = {
  Sobresaliente: 4,
  Notable: 3,
  Bien: 2,
  Suspenso: 1,
  'Sin probar': 0,
  '': -1,
};

function ratingScore(r: NivelGusto): number {
  return ratingOrder[r] ?? -1;
}

export default function Valoraciones() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<ViewMode>('top-ambos');

  useEffect(() => {
    fetch('/api/recipes')
      .then((r) => r.json())
      .then(setRecipes)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const sorted = useMemo(() => {
    const list = [...recipes];
    switch (view) {
      case 'top-ambos':
        return list.sort(
          (a, b) =>
            ratingScore(b.nivelIvan) + ratingScore(b.nivelVero) -
            (ratingScore(a.nivelIvan) + ratingScore(a.nivelVero))
        );
      case 'top-ivan':
        return list
          .filter((r) => r.nivelIvan && r.nivelIvan !== 'Sin probar')
          .sort((a, b) => ratingScore(b.nivelIvan) - ratingScore(a.nivelIvan));
      case 'top-vero':
        return list
          .filter((r) => r.nivelVero && r.nivelVero !== 'Sin probar')
          .sort((a, b) => ratingScore(b.nivelVero) - ratingScore(a.nivelVero));
      case 'coinciden':
        return list.filter(
          (r) =>
            r.nivelIvan === 'Sobresaliente' && r.nivelVero === 'Sobresaliente'
        );
    }
  }, [recipes, view]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin h-8 w-8 border-3 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">⭐ Valoraciones</h1>

      <div className="flex flex-wrap gap-2 mb-6">
        {[
          { key: 'top-ambos', label: '🏆 Top general' },
          { key: 'top-ivan', label: '👨 Mejores Iván' },
          { key: 'top-vero', label: '👩 Mejores Vero' },
          { key: 'coinciden', label: '💕 Ambos Sobresaliente' },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setView(key as ViewMode)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium border ${
              view === key
                ? 'bg-primary text-white border-primary'
                : 'bg-bg-card border-border text-text-muted hover:border-primary'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <p className="text-xs text-text-muted mb-3">
        {sorted.length} receta{sorted.length !== 1 ? 's' : ''}
      </p>

      {sorted.length === 0 ? (
        <p className="text-center py-20 text-text-muted">
          No hay recetas con estos criterios
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {sorted.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      )}
    </div>
  );
}
