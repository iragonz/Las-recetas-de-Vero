'use client';

import { useState } from 'react';
import type { Recipe, PlannedRecipe } from '../_lib/types';

interface RandomRecipeButtonProps {
  hechas: Recipe[];
  porHacer: PlannedRecipe[];
}

type Fuente = 'hechas' | 'porHacer' | 'ambas';

export default function RandomRecipeButton({ hechas, porHacer }: RandomRecipeButtonProps) {
  const [open, setOpen] = useState(false);

  const total = hechas.length + porHacer.length;

  // Rutas candidatas para cada fuente, respetando los filtros activos.
  function rutasDe(fuente: Fuente): string[] {
    const deHechas = hechas.map((r) => `/receta/${r.id}`);
    const dePorHacer = porHacer.map((r) => `/planificada/${r.id}`);
    if (fuente === 'hechas') return deHechas;
    if (fuente === 'porHacer') return dePorHacer;
    return [...deHechas, ...dePorHacer];
  }

  const opciones: { fuente: Fuente; label: string; count: number }[] = [
    { fuente: 'hechas', label: '🍳 Una que ya hemos hecho', count: hechas.length },
    { fuente: 'porHacer', label: '📋 Una que aún no hemos hecho', count: porHacer.length },
    { fuente: 'ambas', label: '🎯 Me da igual, de las dos', count: total },
  ];

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        disabled={total === 0}
        className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-accent text-white px-4 py-2.5 text-sm font-semibold shadow-md hover:shadow-lg active:scale-95 disabled:opacity-50"
      >
        🎲 ¿Qué comemos hoy?
      </button>

      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-bg-card rounded-t-2xl sm:rounded-2xl w-full max-w-sm p-4 space-y-2"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-semibold text-sm mb-3">🎲 ¿De dónde la saco?</h3>

            {opciones.map(({ fuente, label, count }) => (
              <button
                key={fuente}
                onClick={() => {
                  const rutas = rutasDe(fuente);
                  if (rutas.length === 0) return;
                  window.location.href = rutas[Math.floor(Math.random() * rutas.length)];
                }}
                disabled={count === 0}
                className="w-full flex items-center justify-between rounded-xl border border-border bg-bg px-4 py-3 text-sm font-medium hover:border-primary hover:bg-primary/5 active:scale-[0.98] disabled:opacity-40 disabled:hover:border-border disabled:hover:bg-bg"
              >
                <span>{label}</span>
                <span className="text-xs text-text-muted">{count}</span>
              </button>
            ))}

            <button
              onClick={() => setOpen(false)}
              className="w-full py-2.5 text-sm text-text-muted hover:text-text"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </>
  );
}
