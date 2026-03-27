'use client';

import { useState, useEffect, useMemo } from 'react';
import type { Recipe, PlannedRecipe } from './_lib/types';
import RecipeCard from './_components/RecipeCard';
import RecipeListItem from './_components/RecipeListItem';
import PlannedRecipeCard from './_components/PlannedRecipeCard';
import PlannedRecipeListItem from './_components/PlannedRecipeListItem';
import FilterBar from './_components/FilterBar';
import PlannedFilterBar from './_components/PlannedFilterBar';
import type { SortOption, ViewMode } from './_components/FilterBar';
import type { PlannedSortOption } from './_components/PlannedFilterBar';
import RandomRecipeButton from './_components/RandomRecipeButton';
import Link from 'next/link';

type Tab = 'hechas' | 'planificadas';

const RATING_ORDER: Record<string, number> = {
  'Sobresaliente': 4,
  'Notable': 3,
  'Bien': 2,
  'Suspenso': 1,
  'Sin probar': 0,
  '': -1,
};

function sortRecipes(recipes: Recipe[], sort: SortOption): Recipe[] {
  const sorted = [...recipes];
  switch (sort) {
    case 'nombre-asc':
      return sorted.sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
    case 'nombre-desc':
      return sorted.sort((a, b) => b.nombre.localeCompare(a.nombre, 'es'));
    case 'tiempo-asc':
      return sorted.sort((a, b) => (a.tiempoPreparacion ?? 999) - (b.tiempoPreparacion ?? 999));
    case 'tiempo-desc':
      return sorted.sort((a, b) => (b.tiempoPreparacion ?? 0) - (a.tiempoPreparacion ?? 0));
    case 'ivan-desc':
      return sorted.sort((a, b) => (RATING_ORDER[b.nivelIvan] ?? -1) - (RATING_ORDER[a.nivelIvan] ?? -1));
    case 'vero-desc':
      return sorted.sort((a, b) => (RATING_ORDER[b.nivelVero] ?? -1) - (RATING_ORDER[a.nivelVero] ?? -1));
    case 'favoritos':
      return sorted.sort((a, b) => (b.favorito ? 1 : 0) - (a.favorito ? 1 : 0));
    default:
      return sorted;
  }
}

export default function Home() {
  const [tab, setTab] = useState<Tab>('hechas');

  // Hechas state
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loadingRecipes, setLoadingRecipes] = useState(true);
  const [search, setSearch] = useState('');
  const [categoria, setCategoria] = useState('');
  const [tipo, setTipo] = useState('');
  const [soloFavoritos, setSoloFavoritos] = useState(false);
  const [valoracion, setValoracion] = useState('');
  const [sort, setSort] = useState<SortOption>('nombre-asc');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [error, setError] = useState('');

  // Planificadas state
  const [planned, setPlanned] = useState<PlannedRecipe[]>([]);
  const [plannedLoadState, setPlannedLoadState] = useState<'idle' | 'loading' | 'done'>('idle');
  const [pSearch, setPSearch] = useState('');
  const [pCategoria, setPCategoria] = useState('');
  const [pTipo, setPTipo] = useState('');
  const [pSort, setPSort] = useState<PlannedSortOption>('nombre-asc');
  const [pViewMode, setPViewMode] = useState<ViewMode>('grid');
  const [pError, setPError] = useState('');

  // Load hechas on mount
  useEffect(() => {
    fetch('/api/recipes')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setRecipes(data);
        else setError(data.error || JSON.stringify(data));
      })
      .catch(() => setError('Error de conexión'))
      .finally(() => setLoadingRecipes(false));
  }, []);

  // Load planificadas on first tab switch
  const shouldLoadPlanned = tab === 'planificadas' && plannedLoadState === 'idle';
  if (shouldLoadPlanned && plannedLoadState === 'idle') {
    setPlannedLoadState('loading');
  }
  useEffect(() => {
    if (plannedLoadState !== 'loading') return;
    let cancelled = false;
    fetch('/api/planned')
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        if (Array.isArray(data)) setPlanned(data);
        else setPError(data.error || JSON.stringify(data));
      })
      .catch(() => { if (!cancelled) setPError('Error de conexión'); })
      .finally(() => { if (!cancelled) setPlannedLoadState('done'); });
    return () => { cancelled = true; };
  }, [plannedLoadState]);

  const filtered = useMemo(() => {
    const result = recipes.filter((r) => {
      if (search && !r.nombre.toLowerCase().includes(search.toLowerCase()) &&
          !r.ingredientes.toLowerCase().includes(search.toLowerCase())) return false;
      if (categoria && !r.categoria.includes(categoria)) return false;
      if (tipo && !r.tipo.includes(tipo)) return false;
      if (soloFavoritos && !r.favorito) return false;
      if (valoracion && r.nivelIvan !== valoracion && r.nivelVero !== valoracion) return false;
      return true;
    });
    return sortRecipes(result, sort);
  }, [recipes, search, categoria, tipo, soloFavoritos, valoracion, sort]);

  const filteredPlanned = useMemo(() => {
    const result = planned.filter((r) => {
      if (pSearch && !r.nombre.toLowerCase().includes(pSearch.toLowerCase()) &&
          !r.ingredientes.toLowerCase().includes(pSearch.toLowerCase())) return false;
      if (pCategoria && !r.categoria.includes(pCategoria)) return false;
      if (pTipo && !r.tipo.includes(pTipo)) return false;
      return true;
    });
    const sorted = [...result];
    if (pSort === 'nombre-desc') return sorted.sort((a, b) => b.nombre.localeCompare(a.nombre, 'es'));
    return sorted.sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
  }, [planned, pSearch, pCategoria, pTipo, pSort]);

  return (
    <div>
      {/* Header */}
      <div className="mb-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-text">Las Recetas de Vero</h1>
            <p className="text-xs text-text-muted mt-0.5">Nuestro recetario con mucho amor</p>
          </div>
          <div className="flex gap-2">
            {tab === 'hechas' && <RandomRecipeButton recipes={filtered} />}
            <Link
              href={tab === 'hechas' ? '/receta/nueva' : '/planificada/nueva'}
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-success to-emerald-500 text-white px-4 py-2.5 text-sm font-semibold shadow-md hover:shadow-lg active:scale-95"
            >
              + Nueva
            </Link>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex rounded-2xl border border-border/60 overflow-hidden mb-5 shadow-sm">
        <button
          onClick={() => setTab('hechas')}
          className={`flex-1 px-4 py-2.5 text-sm font-medium transition-all ${
            tab === 'hechas'
              ? 'bg-gradient-to-r from-primary to-primary-light text-white'
              : 'bg-bg-card text-text-muted hover:text-primary'
          }`}
        >
          Hechas {recipes.length > 0 && <span className="text-xs opacity-75">({recipes.length})</span>}
        </button>
        <button
          onClick={() => setTab('planificadas')}
          className={`flex-1 px-4 py-2.5 text-sm font-medium transition-all ${
            tab === 'planificadas'
              ? 'bg-gradient-to-r from-primary to-primary-light text-white'
              : 'bg-bg-card text-text-muted hover:text-primary'
          }`}
        >
          Por hacer {planned.length > 0 && <span className="text-xs opacity-75">({planned.length})</span>}
        </button>
      </div>

      {tab === 'hechas' ? (
        <>
          <FilterBar
            search={search}
            onSearchChange={setSearch}
            categoria={categoria}
            onCategoriaChange={setCategoria}
            tipo={tipo}
            onTipoChange={setTipo}
            soloFavoritos={soloFavoritos}
            onFavoritosChange={setSoloFavoritos}
            valoracion={valoracion}
            onValoracionChange={setValoracion}
            sort={sort}
            onSortChange={setSort}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />

          <p className="text-xs text-text-muted mb-3">
            {filtered.length} receta{filtered.length !== 1 ? 's' : ''}
          </p>

          {loadingRecipes ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin h-8 w-8 border-3 border-primary border-t-transparent rounded-full" />
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <p className="text-danger font-medium mb-2">Error al cargar recetas</p>
              <p className="text-xs text-text-muted max-w-md mx-auto break-all">{error}</p>
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-center py-20 text-text-muted">
              No se encontraron recetas con esos filtros
            </p>
          ) : viewMode === 'grid' ? (
            <div className="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {filtered.map((recipe) => (
                <RecipeCard key={recipe.id} recipe={recipe} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {filtered.map((recipe) => (
                <RecipeListItem key={recipe.id} recipe={recipe} />
              ))}
            </div>
          )}
        </>
      ) : (
        <>
          <PlannedFilterBar
            search={pSearch}
            onSearchChange={setPSearch}
            categoria={pCategoria}
            onCategoriaChange={setPCategoria}
            tipo={pTipo}
            onTipoChange={setPTipo}
            sort={pSort}
            onSortChange={setPSort}
            viewMode={pViewMode}
            onViewModeChange={setPViewMode}
          />

          <p className="text-xs text-text-muted mb-3">
            {filteredPlanned.length} receta{filteredPlanned.length !== 1 ? 's' : ''} planificada{filteredPlanned.length !== 1 ? 's' : ''}
          </p>

          {plannedLoadState === 'loading' ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin h-8 w-8 border-3 border-primary border-t-transparent rounded-full" />
            </div>
          ) : pError ? (
            <div className="text-center py-20">
              <p className="text-danger font-medium mb-2">Error al cargar recetas planificadas</p>
              <p className="text-xs text-text-muted max-w-md mx-auto break-all">{pError}</p>
            </div>
          ) : filteredPlanned.length === 0 ? (
            <p className="text-center py-20 text-text-muted">
              No se encontraron recetas planificadas
            </p>
          ) : pViewMode === 'grid' ? (
            <div className="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {filteredPlanned.map((recipe) => (
                <PlannedRecipeCard key={recipe.id} recipe={recipe} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {filteredPlanned.map((recipe) => (
                <PlannedRecipeListItem key={recipe.id} recipe={recipe} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
