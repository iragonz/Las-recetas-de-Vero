'use client';

import { useEffect, useState } from 'react';
import type { AppOptions } from './types';
import { CATEGORIAS, TIPOS, NIVELES_GUSTO } from './types';

// Lo que se enseña mientras llega la respuesta, y si Notion no contesta.
const FALLBACK: AppOptions = {
  hechas: {
    categorias: [...CATEGORIAS],
    tipos: [...TIPOS],
    nivelIvan: [...NIVELES_GUSTO],
    nivelVero: [...NIVELES_GUSTO],
  },
  planificadas: {
    categorias: [...CATEGORIAS],
    tipos: [...TIPOS],
  },
};

/** Una lista vacía casi siempre significa que la propiedad cambió de
 *  nombre en Notion. En ese caso es mejor el respaldo que un desplegable
 *  sin opciones. */
function orFallback(list: unknown, fallback: string[]): string[] {
  return Array.isArray(list) && list.length > 0 ? (list as string[]) : fallback;
}

function normalize(data: unknown): AppOptions {
  const d = data as Partial<AppOptions> | null;
  return {
    hechas: {
      categorias: orFallback(d?.hechas?.categorias, FALLBACK.hechas.categorias),
      tipos: orFallback(d?.hechas?.tipos, FALLBACK.hechas.tipos),
      nivelIvan: orFallback(d?.hechas?.nivelIvan, FALLBACK.hechas.nivelIvan),
      nivelVero: orFallback(d?.hechas?.nivelVero, FALLBACK.hechas.nivelVero),
    },
    planificadas: {
      categorias: orFallback(d?.planificadas?.categorias, FALLBACK.planificadas.categorias),
      tipos: orFallback(d?.planificadas?.tipos, FALLBACK.planificadas.tipos),
    },
  };
}

// Una sola petición por carga de página, compartida por todos los
// componentes que piden opciones (formularios y barras de filtros).
let pending: Promise<AppOptions> | null = null;

function loadOptions(): Promise<AppOptions> {
  if (!pending) {
    pending = fetch('/api/opciones')
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('respuesta no válida'))))
      .then(normalize)
      .catch(() => FALLBACK);
  }
  return pending;
}

export function useOptions(): AppOptions {
  const [options, setOptions] = useState<AppOptions>(FALLBACK);

  useEffect(() => {
    let alive = true;
    loadOptions().then((o) => { if (alive) setOptions(o); });
    return () => { alive = false; };
  }, []);

  return options;
}
