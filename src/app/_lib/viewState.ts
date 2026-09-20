'use client';

import type { SortOption, ViewMode } from '../_components/FilterBar';
import type { PlannedSortOption } from '../_components/PlannedFilterBar';

export type Tab = 'hechas' | 'planificadas';

/**
 * Dónde estabas en la lista de recetas: pestaña, filtros y posición.
 * Se guarda en sessionStorage, así que dura mientras la app esté abierta
 * y se borra sola al cerrarla.
 */
export interface ListViewState {
  tab: Tab;
  scrollY: number;
  hechas: {
    search: string;
    categoria: string;
    tipo: string;
    soloFavoritos: boolean;
    valoracion: string;
    sort: SortOption;
    viewMode: ViewMode;
  };
  planificadas: {
    search: string;
    categoria: string;
    tipo: string;
    sort: PlannedSortOption;
    viewMode: ViewMode;
  };
}

export const DEFAULT_LIST_VIEW: ListViewState = {
  tab: 'hechas',
  scrollY: 0,
  hechas: {
    search: '',
    categoria: '',
    tipo: '',
    soloFavoritos: false,
    valoracion: '',
    sort: 'nombre-asc',
    viewMode: 'grid',
  },
  planificadas: {
    search: '',
    categoria: '',
    tipo: '',
    sort: 'nombre-asc',
    viewMode: 'grid',
  },
};

const KEY = 'recetario-vista-recetas';

/** Lee lo guardado. Devuelve los valores por defecto si no hay nada,
 *  si el navegador bloquea el almacenamiento, o durante el renderizado
 *  en servidor (donde sessionStorage no existe). */
export function readListView(): ListViewState {
  if (typeof window === 'undefined') return DEFAULT_LIST_VIEW;
  try {
    const raw = window.sessionStorage.getItem(KEY);
    if (!raw) return DEFAULT_LIST_VIEW;
    const saved = JSON.parse(raw) as Partial<ListViewState>;
    return {
      tab: saved.tab === 'planificadas' ? 'planificadas' : 'hechas',
      scrollY: typeof saved.scrollY === 'number' && saved.scrollY > 0 ? saved.scrollY : 0,
      hechas: { ...DEFAULT_LIST_VIEW.hechas, ...saved.hechas },
      planificadas: { ...DEFAULT_LIST_VIEW.planificadas, ...saved.planificadas },
    };
  } catch {
    return DEFAULT_LIST_VIEW;
  }
}

function save(state: ListViewState): void {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // Sin almacenamiento disponible: la app sigue funcionando, solo que
    // no recuerda dónde estabas.
  }
}

/** Guarda pestaña y filtros sin tocar la posición apuntada. */
export function writeFilters(view: Omit<ListViewState, 'scrollY'>): void {
  save({ ...view, scrollY: readListView().scrollY });
}

/** Guarda la posición sin tocar la pestaña ni los filtros. */
export function writeScrollY(scrollY: number): void {
  save({ ...readListView(), scrollY });
}
