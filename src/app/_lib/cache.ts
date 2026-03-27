import type { Recipe, PlannedRecipe } from './types';

// Cache compartido entre todas las rutas API
let recipesCache: { data: Recipe[]; timestamp: number } | null = null;
let plannedCache: { data: PlannedRecipe[]; timestamp: number } | null = null;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

export function getCachedRecipes(): Recipe[] | null {
  if (recipesCache && Date.now() - recipesCache.timestamp < CACHE_TTL) {
    return recipesCache.data;
  }
  return null;
}

export function setCachedRecipes(data: Recipe[]): void {
  recipesCache = { data, timestamp: Date.now() };
}

export function getCachedRecipe(id: string): Recipe | null {
  const recipes = getCachedRecipes();
  if (!recipes) return null;
  return recipes.find((r) => r.id === id) ?? null;
}

export function invalidateCache(): void {
  recipesCache = null;
}

// Planned recipes cache
export function getCachedPlanned(): PlannedRecipe[] | null {
  if (plannedCache && Date.now() - plannedCache.timestamp < CACHE_TTL) {
    return plannedCache.data;
  }
  return null;
}

export function setCachedPlanned(data: PlannedRecipe[]): void {
  plannedCache = { data, timestamp: Date.now() };
}

export function getCachedPlannedRecipe(id: string): PlannedRecipe | null {
  const recipes = getCachedPlanned();
  if (!recipes) return null;
  return recipes.find((r) => r.id === id) ?? null;
}

export function invalidatePlannedCache(): void {
  plannedCache = null;
}
