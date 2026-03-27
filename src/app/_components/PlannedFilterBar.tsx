'use client';

import { CATEGORIAS, TIPOS } from '../_lib/types';
import type { ViewMode } from './FilterBar';

export type PlannedSortOption = 'nombre-asc' | 'nombre-desc';

interface PlannedFilterBarProps {
  search: string;
  onSearchChange: (v: string) => void;
  categoria: string;
  onCategoriaChange: (v: string) => void;
  tipo: string;
  onTipoChange: (v: string) => void;
  sort: PlannedSortOption;
  onSortChange: (v: PlannedSortOption) => void;
  viewMode: ViewMode;
  onViewModeChange: (v: ViewMode) => void;
}

export default function PlannedFilterBar(props: PlannedFilterBarProps) {
  return (
    <div className="space-y-3 mb-6">
      <input
        type="text"
        placeholder="Buscar receta planificada..."
        value={props.search}
        onChange={(e) => props.onSearchChange(e.target.value)}
        className="w-full rounded-xl border border-border bg-bg-card px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
      />

      <div className="flex flex-wrap gap-2">
        <select
          value={props.categoria}
          onChange={(e) => props.onCategoriaChange(e.target.value)}
          className="rounded-lg border border-border bg-bg-card px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          <option value="">Todas las categorías</option>
          {CATEGORIAS.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <select
          value={props.tipo}
          onChange={(e) => props.onTipoChange(e.target.value)}
          className="rounded-lg border border-border bg-bg-card px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          <option value="">Todos los tipos</option>
          {TIPOS.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-2">
        <select
          value={props.sort}
          onChange={(e) => props.onSortChange(e.target.value as PlannedSortOption)}
          className="rounded-lg border border-border bg-bg-card px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          <option value="nombre-asc">Nombre A-Z</option>
          <option value="nombre-desc">Nombre Z-A</option>
        </select>

        <div className="flex rounded-lg border border-border overflow-hidden ml-auto">
          <button
            onClick={() => props.onViewModeChange('grid')}
            className={`px-2.5 py-1.5 text-xs ${
              props.viewMode === 'grid'
                ? 'bg-primary text-white'
                : 'bg-bg-card text-text-muted hover:text-primary'
            }`}
            title="Vista tarjetas"
          >
            ▦
          </button>
          <button
            onClick={() => props.onViewModeChange('list')}
            className={`px-2.5 py-1.5 text-xs ${
              props.viewMode === 'list'
                ? 'bg-primary text-white'
                : 'bg-bg-card text-text-muted hover:text-primary'
            }`}
            title="Vista lista"
          >
            ☰
          </button>
        </div>
      </div>
    </div>
  );
}
