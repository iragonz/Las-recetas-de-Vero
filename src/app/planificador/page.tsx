'use client';

import { useState, useEffect } from 'react';
import type { Recipe, WeeklyPlan } from '../_lib/types';

const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
const STORAGE_KEY = 'recetario-weekly-plan';

export default function Planificador() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [plan, setPlan] = useState<WeeklyPlan>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) { try { return JSON.parse(saved); } catch { /* ignore */ } }
    }
    return {};
  });
  const [loading, setLoading] = useState(true);
  const [selecting, setSelecting] = useState<{ day: string; meal: 'comida' | 'cena' } | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/recipes')
      .then((r) => r.json())
      .then(setRecipes)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  function savePlan(newPlan: WeeklyPlan) {
    setPlan(newPlan);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newPlan));
  }

  function assignRecipe(recipeId: string) {
    if (!selecting) return;
    const newPlan = { ...plan };
    if (!newPlan[selecting.day]) newPlan[selecting.day] = {};
    newPlan[selecting.day][selecting.meal] = recipeId;
    savePlan(newPlan);
    setSelecting(null);
    setSearch('');
  }

  function removeRecipe(day: string, meal: 'comida' | 'cena') {
    const newPlan = { ...plan };
    if (newPlan[day]) {
      delete newPlan[day][meal];
    }
    savePlan(newPlan);
  }

  function clearWeek() {
    if (confirm('¿Limpiar toda la semana?')) {
      savePlan({});
    }
  }

  function getRecipeName(id: string): string {
    return recipes.find((r) => r.id === id)?.nombre ?? 'Receta desconocida';
  }

  function getPlannedRecipeIds(): string[] {
    return Object.values(plan).flatMap((day) =>
      [day.comida, day.cena].filter(Boolean) as string[]
    );
  }

  const filteredRecipes = recipes.filter(
    (r) =>
      !search || r.nombre.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin h-8 w-8 border-3 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">📅 Planificador Semanal</h1>
        <button
          onClick={clearWeek}
          className="text-xs text-text-muted hover:text-danger"
        >
          Limpiar semana
        </button>
      </div>

      <div className="space-y-3">
        {DIAS.map((day) => (
          <div key={day} className="bg-bg-card rounded-xl border border-border p-4">
            <h3 className="font-semibold text-sm mb-2">{day}</h3>
            <div className="grid grid-cols-2 gap-2">
              {(['comida', 'cena'] as const).map((meal) => {
                const recipeId = plan[day]?.[meal];
                return (
                  <div key={meal} className="min-h-[52px]">
                    <span className="text-[10px] text-text-muted uppercase font-medium">
                      {meal === 'comida' ? '🌞 Comida' : '🌙 Cena'}
                    </span>
                    {recipeId ? (
                      <div className="flex items-center gap-1 mt-0.5">
                        <span className="text-xs font-medium flex-1 truncate">
                          {getRecipeName(recipeId)}
                        </span>
                        <button
                          onClick={() => removeRecipe(day, meal)}
                          className="text-xs text-text-muted hover:text-danger shrink-0"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setSelecting({ day, meal })}
                        className="text-xs text-primary hover:underline mt-0.5"
                      >
                        + Añadir
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Link to shopping list */}
      {getPlannedRecipeIds().length > 0 && (
        <a
          href={`/lista-compra?ids=${getPlannedRecipeIds().join(',')}`}
          className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-primary text-white py-3 text-sm font-semibold hover:bg-primary-dark active:scale-95"
        >
          🛒 Generar lista de la compra
        </a>
      )}

      {/* Recipe selector modal */}
      {selecting && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-lg max-h-[70vh] flex flex-col">
            <div className="p-4 border-b border-border flex justify-between items-center">
              <h3 className="font-semibold">
                {selecting.day} - {selecting.meal === 'comida' ? 'Comida' : 'Cena'}
              </h3>
              <button
                onClick={() => { setSelecting(null); setSearch(''); }}
                className="text-text-muted hover:text-text"
              >
                ✕
              </button>
            </div>
            <div className="p-4">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar receta..."
                autoFocus
                className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-1">
              {filteredRecipes.map((r) => (
                <button
                  key={r.id}
                  onClick={() => assignRecipe(r.id)}
                  className="w-full text-left rounded-lg px-3 py-2 text-sm hover:bg-primary/5 active:bg-primary/10"
                >
                  {r.favorito && '❤️ '}{r.nombre}
                  <span className="text-xs text-text-muted ml-2">
                    {r.categoria.join(', ')}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
