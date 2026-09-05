import { getDatabaseOptions } from '../../_lib/notion';
import { getCachedOptions, setCachedOptions } from '../../_lib/cache';

export async function GET() {
  try {
    const cached = getCachedOptions();
    if (cached) return Response.json(cached);

    const options = await getDatabaseOptions();
    setCachedOptions(options);
    return Response.json(options);
  } catch (error) {
    console.error('Error fetching database options:', error);
    return Response.json({ error: 'No se pudieron leer las opciones de Notion' }, { status: 500 });
  }
}
