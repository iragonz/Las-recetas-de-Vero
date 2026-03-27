import { NextRequest } from 'next/server';
import { getRecipes, createRecipe } from '../../_lib/notion';
import { getCachedRecipes, setCachedRecipes, invalidateCache } from '../../_lib/cache';

export async function GET(request: NextRequest) {
  try {
    const forceRefresh = request.nextUrl.searchParams.get('refresh') === '1';

    if (!forceRefresh) {
      const cached = getCachedRecipes();
      if (cached) return Response.json(cached);
    }

    const recipes = await getRecipes();
    setCachedRecipes(recipes);
    return Response.json(recipes);
  } catch (error: unknown) {
    const err = error as Error & { code?: string; status?: number };
    console.error('Error fetching recipes:', err.message);
    return Response.json(
      { error: err.message || 'Error al obtener recetas' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const recipe = await createRecipe(data);
    invalidateCache();
    return Response.json(recipe, { status: 201 });
  } catch (error) {
    console.error('Error creating recipe:', error);
    return Response.json({ error: 'Error al crear receta' }, { status: 500 });
  }
}
