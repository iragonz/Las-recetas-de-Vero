import { NextRequest } from 'next/server';
import { getPlannedRecipe, updatePlannedRecipe, deletePlannedRecipe, movePlannedToDone } from '../../../_lib/notion';
import { getCachedPlannedRecipe, invalidatePlannedCache, invalidateCache } from '../../../_lib/cache';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cached = getCachedPlannedRecipe(id);
    if (cached) return Response.json(cached);

    const recipe = await getPlannedRecipe(id);
    return Response.json(recipe);
  } catch (error) {
    console.error('Error fetching planned recipe:', error);
    return Response.json({ error: 'Receta no encontrada' }, { status: 404 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Special action: move to done
    if (body._action === 'move_to_done') {
      const recipe = await movePlannedToDone(id);
      invalidatePlannedCache();
      invalidateCache();
      return Response.json({ recipe, moved: true });
    }

    const recipe = await updatePlannedRecipe(id, body);
    invalidatePlannedCache();
    return Response.json(recipe);
  } catch (error) {
    console.error('Error updating planned recipe:', error);
    return Response.json({ error: 'Error al actualizar receta' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await deletePlannedRecipe(id);
    invalidatePlannedCache();
    return Response.json({ success: true });
  } catch (error) {
    console.error('Error deleting planned recipe:', error);
    return Response.json({ error: 'Error al eliminar receta' }, { status: 500 });
  }
}
