'use client';

import { useState, useEffect, useMemo } from 'react';
import type { Recipe, WeeklyPlan } from '../_lib/types';

const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

type WeekTab = 'current' | 'next';

function getMonday(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatDateShort(date: Date): string {
  return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
}

function getMondayISO(weekTab: WeekTab): string {
  const now = new Date();
  const monday = getMonday(now);
  if (weekTab === 'next') monday.setDate(monday.getDate() + 7);
  return monday.toISOString().slice(0, 10);
}

function getWeekRange(weekTab: WeekTab): string {
  const now = new Date();
  const monday = getMonday(now);
  if (weekTab === 'next') monday.setDate(monday.getDate() + 7);
  const sunday = new Date(monday);
  sunday.setDate(sunday.getDate() + 6);
  return `${formatDateShort(monday)} – ${formatDateShort(sunday)}`;
}

export default function Planificador() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [weekTab, setWeekTab] = useState<WeekTab>('current');
  const [plan, setPlan] = useState<WeeklyPlan>({});
  const [loading, setLoading] = useState(true);
  const [planVersion, setPlanVersion] = useState(0);
  const [planLoaded, setPlanLoaded] = useState(false);
  const [selecting, setSelecting] = useState<{ day: string; meal: 'comida' | 'cena' } | null>(null);
  const [search, setSearch] = useState('');

  // Trigger plan re-fetch when weekTab changes (render-time state transition)
  const planKey = getMondayISO(weekTab);
  const [lastPlanKey, setLastPlanKey] = useState(planKey);
  if (planKey !== lastPlanKey) {
    setLastPlanKey(planKey);
    setPlanLoaded(false);
    setPlanVersion((v) => v + 1);
  }

  useEffect(() => {
    fetch('/api/recipes')
      .then((r) => r.json())
      .then(setRecipes)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let cancelled = false;
    const monday = getMondayISO(weekTab);
    fetch(`/api/planner?week=${monday}`)
      .then((r) => r.json())
      .then((data) => { if (!cancelled) setPlan(data ?? {}); })
      .catch(() => { if (!cancelled) setPlan({}); })
      .finally(() => { if (!cancelled) setPlanLoaded(true); });
    return () => { cancelled = true; };
  }, [weekTab, planVersion]);

  function savePlan(newPlan: WeeklyPlan) {
    setPlan(newPlan);
    const monday = getMondayISO(weekTab);
    fetch(`/api/planner?week=${monday}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newPlan),
    }).catch(console.error);
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

  const plannedRecipeIds = useMemo(() =>
    Object.values(plan).flatMap((day) =>
      [day.comida, day.cena].filter(Boolean) as string[]
    ), [plan]);

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
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Planificador Semanal</h1>
        <button
          onClick={clearWeek}
          className="text-xs text-text-muted hover:text-danger"
        >
          Limpiar semana
        </button>
      </div>

      {/* Week tabs */}
      <div className="flex rounded-xl border border-border overflow-hidden mb-4">
        <button
          onClick={() => setWeekTab('current')}
          className={`flex-1 px-4 py-2.5 text-sm font-medium transition-colors ${
            weekTab === 'current'
              ? 'bg-primary text-white'
              : 'bg-bg-card text-text-muted hover:text-primary'
          }`}
        >
          Esta semana
        </button>
        <button
          onClick={() => setWeekTab('next')}
          className={`flex-1 px-4 py-2.5 text-sm font-medium transition-colors ${
            weekTab === 'next'
              ? 'bg-primary text-white'
              : 'bg-bg-card text-text-muted hover:text-primary'
          }`}
        >
          Semana que viene
        </button>
      </div>

      <p className="text-xs text-text-muted mb-3">{getWeekRange(weekTab)}</p>

      {!planLoaded ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin h-8 w-8 border-3 border-primary border-t-transparent rounded-full" />
        </div>
      ) : (
        <>
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
          {plannedRecipeIds.length > 0 && (
            <a
              href={`/lista-compra?ids=${plannedRecipeIds.join(',')}`}
              className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-primary text-white py-3 text-sm font-semibold hover:bg-primary-dark active:scale-95"
            >
              🛒 Generar lista de la compra
            </a>
          )}
        </>
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
