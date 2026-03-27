import { NextRequest } from 'next/server';
import { getPlannedRecipes, createPlannedRecipe } from '../../_lib/notion';
import { getCachedPlanned, setCachedPlanned, invalidatePlannedCache } from '../../_lib/cache';

export async function GET(request: NextRequest) {
  try {
    const forceRefresh = request.nextUrl.searchParams.get('refresh') === '1';

    if (!forceRefresh) {
      const cached = getCachedPlanned();
      if (cached) return Response.json(cached);
    }

    const recipes = await getPlannedRecipes();
    setCachedPlanned(recipes);
    return Response.json(recipes);
  } catch (error: unknown) {
    const err = error as Error & { code?: string; status?: number };
    console.error('Error fetching planned recipes:', err.message);
    return Response.json(
      { error: err.message || 'Error al obtener recetas planificadas' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const recipe = await createPlannedRecipe(data);
    invalidatePlannedCache();
    return Response.json(recipe, { status: 201 });
  } catch (error) {
    console.error('Error creating planned recipe:', error);
    return Response.json({ error: 'Error al crear receta planificada' }, { status: 500 });
  }
}
