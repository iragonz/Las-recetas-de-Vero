import { NextRequest } from 'next/server';
import { getRecipe, updateRecipe, deleteRecipe } from '../../../_lib/notion';
import { getCachedRecipe, invalidateCache } from '../../../_lib/cache';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cached = getCachedRecipe(id);
    if (cached) return Response.json(cached);

    const recipe = await getRecipe(id);
    return Response.json(recipe);
  } catch (error) {
    console.error('Error fetching recipe:', error);
    return Response.json({ error: 'Receta no encontrada' }, { status: 404 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await request.json();
    const recipe = await updateRecipe(id, data);
    invalidateCache();
    return Response.json(recipe);
  } catch (error) {
    console.error('Error updating recipe:', error);
    return Response.json({ error: 'Error al actualizar receta' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await deleteRecipe(id);
    invalidateCache();
    return Response.json({ success: true });
  } catch (error) {
    console.error('Error deleting recipe:', error);
    return Response.json({ error: 'Error al eliminar receta' }, { status: 500 });
  }
}
