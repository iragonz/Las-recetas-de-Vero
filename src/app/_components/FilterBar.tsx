'use client';

import { CATEGORIAS, TIPOS, NIVELES_GUSTO } from '../_lib/types';

export type SortOption = 'nombre-asc' | 'nombre-desc' | 'tiempo-asc' | 'tiempo-desc' | 'ivan-desc' | 'vero-desc' | 'favoritos';
export type ViewMode = 'grid' | 'list';

interface FilterBarProps {
  search: string;
  onSearchChange: (v: string) => void;
  categoria: string;
  onCategoriaChange: (v: string) => void;
  tipo: string;
  onTipoChange: (v: string) => void;
  soloFavoritos: boolean;
  onFavoritosChange: (v: boolean) => void;
  valoracion: string;
  onValoracionChange: (v: string) => void;
  sort: SortOption;
  onSortChange: (v: SortOption) => void;
  viewMode: ViewMode;
  onViewModeChange: (v: ViewMode) => void;
}

export default function FilterBar(props: FilterBarProps) {
  return (
    <div className="space-y-3 mb-6">
      <input
        type="text"
        placeholder="Buscar receta..."
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

        <select
          value={props.valoracion}
          onChange={(e) => props.onValoracionChange(e.target.value)}
          className="rounded-lg border border-border bg-bg-card px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          <option value="">Cualquier valoración</option>
          {NIVELES_GUSTO.map((n) => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>

        <button
          onClick={() => props.onFavoritosChange(!props.soloFavoritos)}
          className={`rounded-lg px-3 py-1.5 text-xs font-medium border ${
            props.soloFavoritos
              ? 'bg-primary text-white border-primary'
              : 'bg-bg-card border-border text-text-muted hover:border-primary hover:text-primary'
          }`}
        >
          ❤️ Favoritos
        </button>
      </div>

      <div className="flex items-center gap-2">
        <select
          value={props.sort}
          onChange={(e) => props.onSortChange(e.target.value as SortOption)}
          className="rounded-lg border border-border bg-bg-card px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          <option value="nombre-asc">Nombre A-Z</option>
          <option value="nombre-desc">Nombre Z-A</option>
          <option value="tiempo-asc">Menos tiempo</option>
          <option value="tiempo-desc">Más tiempo</option>
          <option value="ivan-desc">Mejor Iván</option>
          <option value="vero-desc">Mejor Vero</option>
          <option value="favoritos">Favoritos primero</option>
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
