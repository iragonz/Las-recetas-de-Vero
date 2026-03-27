import type { Recipe, NivelGusto, PlannedRecipe } from './types';

const NOTION_API = 'https://api.notion.com/v1';
const headers = {
  'Authorization': `Bearer ${process.env.NOTION_API_KEY}`,
  'Content-Type': 'application/json',
  'Notion-Version': '2022-06-28',
};
const databaseId = process.env.NOTION_DATABASE_ID!;
const plannedDbId = process.env.NOTION_PLANNED_DB_ID!;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function notionFetch(path: string, options?: RequestInit): Promise<any> {
  const res = await fetch(`${NOTION_API}${path}`, {
    ...options,
    headers: { ...headers, ...options?.headers },
  });
  const data = await res.json();
  if (!res.ok) {
    const error = new Error(data.message || `Notion API error: ${res.status}`);
    (error as Error & { status: number }).status = res.status;
    (error as Error & { code: string }).code = data.code;
    throw error;
  }
  return data;
}

function extractMultiSelect(prop: unknown): string[] {
  const p = prop as { multi_select?: { name: string }[] };
  return p?.multi_select?.map((s) => s.name) ?? [];
}

function extractSelect(prop: unknown): string {
  const p = prop as { select?: { name: string } | null };
  return p?.select?.name ?? '';
}

function extractRichText(prop: unknown): string {
  const p = prop as { rich_text?: { plain_text: string }[] };
  return p?.rich_text?.map((t) => t.plain_text).join('') ?? '';
}

function extractTitle(prop: unknown): string {
  const p = prop as { title?: { plain_text: string }[] };
  return p?.title?.map((t) => t.plain_text).join('') ?? '';
}

function extractCheckbox(prop: unknown): boolean {
  const p = prop as { checkbox?: boolean };
  return p?.checkbox ?? false;
}

function extractNumber(prop: unknown): number | null {
  const p = prop as { number?: number | null };
  return p?.number ?? null;
}

function extractUrl(prop: unknown): string {
  const p = prop as { url?: string | null };
  return p?.url ?? '';
}

function extractFiles(prop: unknown): string[] {
  const p = prop as { files?: { type: string; external?: { url: string }; file?: { url: string } }[] };
  return (p?.files ?? [])
    .map((f) => f.type === 'external' ? f.external?.url ?? '' : f.file?.url ?? '')
    .filter(Boolean);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function pageToRecipe(page: any): Recipe {
  const props = page.properties;
  return {
    id: page.id,
    nombre: extractTitle(props['Nombre de la Receta']),
    categoria: extractMultiSelect(props['Categoría']),
    favorito: extractCheckbox(props['Favorito']),
    ingredientes: extractRichText(props['Ingredientes']),
    instrucciones: extractRichText(props['Instrucciones']),
    fotos: extractFiles(props['Fotos']),
    link: extractUrl(props['Link']),
    nivelIvan: extractSelect(props['Nivel de gusto Iván']) as NivelGusto,
    nivelVero: extractSelect(props['Nivel de gusto Vero']) as NivelGusto,
    observaciones: extractRichText(props['Observaciones']),
    tiempoPreparacion: extractNumber(props['Tiempo de Preparación']),
    tipo: extractMultiSelect(props['Tipo']),
  };
}

export async function getRecipes(): Promise<Recipe[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pages: any[] = [];
  let cursor: string | undefined = undefined;
  let hasMore = true;

  while (hasMore) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const body: any = { page_size: 100 };
    if (cursor) body.start_cursor = cursor;

    const res = await notionFetch(`/databases/${databaseId}/query`, {
      method: 'POST',
      body: JSON.stringify(body),
    });
    pages.push(...res.results);
    hasMore = res.has_more;
    cursor = res.next_cursor ?? undefined;
  }

  return pages.map(pageToRecipe);
}

export async function getRecipe(id: string): Promise<Recipe> {
  const page = await notionFetch(`/pages/${id}`);
  return pageToRecipe(page);
}

export async function updateRecipe(id: string, data: Partial<Recipe>): Promise<Recipe> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const properties: Record<string, any> = {};

  if (data.nombre !== undefined) {
    properties['Nombre de la Receta'] = {
      title: [{ text: { content: data.nombre } }],
    };
  }
  if (data.categoria !== undefined) {
    properties['Categoría'] = {
      multi_select: data.categoria.map((name) => ({ name })),
    };
  }
  if (data.favorito !== undefined) {
    properties['Favorito'] = { checkbox: data.favorito };
  }
  if (data.ingredientes !== undefined) {
    properties['Ingredientes'] = {
      rich_text: [{ text: { content: data.ingredientes } }],
    };
  }
  if (data.instrucciones !== undefined) {
    properties['Instrucciones'] = {
      rich_text: [{ text: { content: data.instrucciones } }],
    };
  }
  if (data.fotos !== undefined) {
    properties['Fotos'] = {
      files: data.fotos.map((url) => ({ type: 'external', name: url.split('/').pop() || 'foto', external: { url } })),
    };
  }
  if (data.link !== undefined) {
    properties['Link'] = { url: data.link || null };
  }
  if (data.nivelIvan !== undefined) {
    properties['Nivel de gusto Iván'] = {
      select: data.nivelIvan ? { name: data.nivelIvan } : null,
    };
  }
  if (data.nivelVero !== undefined) {
    properties['Nivel de gusto Vero'] = {
      select: data.nivelVero ? { name: data.nivelVero } : null,
    };
  }
  if (data.observaciones !== undefined) {
    properties['Observaciones'] = {
      rich_text: [{ text: { content: data.observaciones } }],
    };
  }
  if (data.tiempoPreparacion !== undefined) {
    properties['Tiempo de Preparación'] = {
      number: data.tiempoPreparacion,
    };
  }
  if (data.tipo !== undefined) {
    properties['Tipo'] = {
      multi_select: data.tipo.map((name) => ({ name })),
    };
  }

  const page = await notionFetch(`/pages/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ properties }),
  });
  return pageToRecipe(page);
}

export async function createRecipe(data: Omit<Recipe, 'id'>): Promise<Recipe> {
  const page = await notionFetch('/pages', {
    method: 'POST',
    body: JSON.stringify({
      parent: { database_id: databaseId },
      properties: {
        'Nombre de la Receta': {
          title: [{ text: { content: data.nombre } }],
        },
        'Categoría': {
          multi_select: data.categoria.map((name) => ({ name })),
        },
        'Favorito': { checkbox: data.favorito },
        'Ingredientes': {
          rich_text: [{ text: { content: data.ingredientes } }],
        },
        'Instrucciones': {
          rich_text: [{ text: { content: data.instrucciones } }],
        },
        'Fotos': {
          files: data.fotos.map((url) => ({ type: 'external', name: url.split('/').pop() || 'foto', external: { url } })),
        },
        'Link': { url: data.link || null },
        'Nivel de gusto Iván': {
          select: data.nivelIvan ? { name: data.nivelIvan } : null,
        },
        'Nivel de gusto Vero': {
          select: data.nivelVero ? { name: data.nivelVero } : null,
        },
        'Observaciones': {
          rich_text: [{ text: { content: data.observaciones } }],
        },
        'Tiempo de Preparación': {
          number: data.tiempoPreparacion,
        },
        'Tipo': {
          multi_select: data.tipo.map((name) => ({ name })),
        },
      },
    }),
  });
  return pageToRecipe(page);
}

export async function deleteRecipe(id: string): Promise<void> {
  await notionFetch(`/pages/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ archived: true }),
  });
}

// ── Planned Recipes ──

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function pageToPlanned(page: any): PlannedRecipe {
  const props = page.properties;
  return {
    id: page.id,
    nombre: extractTitle(props['Nombre de la Receta']),
    categoria: extractMultiSelect(props['Categoría']),
    fotos: extractFiles(props['Fotos']),
    ingredientes: extractRichText(props['Ingredientes']),
    instrucciones: extractRichText(props['Instrucciones']),
    link: extractUrl(props['Link']),
    observaciones: extractRichText(props['Observaciones']),
    tipo: extractMultiSelect(props['Tipo']),
  };
}

export async function getPlannedRecipes(): Promise<PlannedRecipe[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pages: any[] = [];
  let cursor: string | undefined = undefined;
  let hasMore = true;

  while (hasMore) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const body: any = { page_size: 100 };
    if (cursor) body.start_cursor = cursor;

    const res = await notionFetch(`/databases/${plannedDbId}/query`, {
      method: 'POST',
      body: JSON.stringify(body),
    });
    pages.push(...res.results);
    hasMore = res.has_more;
    cursor = res.next_cursor ?? undefined;
  }

  return pages.map(pageToPlanned);
}

export async function getPlannedRecipe(id: string): Promise<PlannedRecipe> {
  const page = await notionFetch(`/pages/${id}`);
  return pageToPlanned(page);
}

export async function createPlannedRecipe(data: Omit<PlannedRecipe, 'id'>): Promise<PlannedRecipe> {
  const page = await notionFetch('/pages', {
    method: 'POST',
    body: JSON.stringify({
      parent: { database_id: plannedDbId },
      properties: {
        'Nombre de la Receta': {
          title: [{ text: { content: data.nombre } }],
        },
        'Categoría': {
          multi_select: data.categoria.map((name) => ({ name })),
        },
        'Ingredientes': {
          rich_text: [{ text: { content: data.ingredientes } }],
        },
        'Instrucciones': {
          rich_text: [{ text: { content: data.instrucciones } }],
        },
        'Fotos': {
          files: data.fotos.map((url) => ({ type: 'external', name: url.split('/').pop() || 'foto', external: { url } })),
        },
        'Link': { url: data.link || null },
        'Observaciones': {
          rich_text: [{ text: { content: data.observaciones } }],
        },
        'Tipo': {
          multi_select: data.tipo.map((name) => ({ name })),
        },
      },
    }),
  });
  return pageToPlanned(page);
}

export async function updatePlannedRecipe(id: string, data: Partial<PlannedRecipe>): Promise<PlannedRecipe> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const properties: Record<string, any> = {};

  if (data.nombre !== undefined) {
    properties['Nombre de la Receta'] = { title: [{ text: { content: data.nombre } }] };
  }
  if (data.categoria !== undefined) {
    properties['Categoría'] = { multi_select: data.categoria.map((name) => ({ name })) };
  }
  if (data.ingredientes !== undefined) {
    properties['Ingredientes'] = { rich_text: [{ text: { content: data.ingredientes } }] };
  }
  if (data.instrucciones !== undefined) {
    properties['Instrucciones'] = { rich_text: [{ text: { content: data.instrucciones } }] };
  }
  if (data.fotos !== undefined) {
    properties['Fotos'] = {
      files: data.fotos.map((url) => ({ type: 'external', name: url.split('/').pop() || 'foto', external: { url } })),
    };
  }
  if (data.link !== undefined) {
    properties['Link'] = { url: data.link || null };
  }
  if (data.observaciones !== undefined) {
    properties['Observaciones'] = { rich_text: [{ text: { content: data.observaciones } }] };
  }
  if (data.tipo !== undefined) {
    properties['Tipo'] = { multi_select: data.tipo.map((name) => ({ name })) };
  }

  const page = await notionFetch(`/pages/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ properties }),
  });
  return pageToPlanned(page);
}

export async function deletePlannedRecipe(id: string): Promise<void> {
  await notionFetch(`/pages/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ archived: true }),
  });
}

// Move planned recipe to done: create in recipes DB, archive in planned DB
export async function movePlannedToDone(id: string): Promise<Recipe> {
  const planned = await getPlannedRecipe(id);
  const recipe = await createRecipe({
    nombre: planned.nombre,
    categoria: planned.categoria,
    favorito: false,
    ingredientes: planned.ingredientes,
    instrucciones: planned.instrucciones,
    fotos: planned.fotos,
    link: planned.link,
    nivelIvan: '',
    nivelVero: '',
    observaciones: planned.observaciones,
    tiempoPreparacion: null,
    tipo: planned.tipo,
  });
  await deletePlannedRecipe(id);
  return recipe;
}
