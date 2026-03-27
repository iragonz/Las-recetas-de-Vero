'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import type { Recipe } from '../../_lib/types';
import RatingBadge from '../../_components/RatingBadge';
import FavoriteButton from '../../_components/FavoriteButton';
import RecipeImage from '../../_components/RecipeImage';

export default function RecipeDetail({
  params,
}: {
  params: Promise<{ id: string }> | { id: string };
}) {
  const { id } = params instanceof Promise ? use(params) : params;
  const router = useRouter();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/recipes/${id}`)
      .then((r) => r.json())
      .then(setRecipe)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  async function handleDelete() {
    if (!confirm('¿Seguro que quieres eliminar esta receta?')) return;
    await fetch(`/api/recipes/${id}`, { method: 'DELETE' });
    router.push('/');
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin h-8 w-8 border-3 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!recipe) {
    return <p className="text-center py-20 text-text-muted">Receta no encontrada</p>;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <button
        onClick={() => router.back()}
        className="text-sm text-text-muted hover:text-primary mb-4 flex items-center gap-1"
      >
        ← Volver
      </button>

      <div className="bg-bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        <RecipeImage
          src={recipe.fotos?.[0]}
          nombre={recipe.nombre}
          size="lg"
        />

        <div className="p-6">
        <div className="flex justify-between items-start">
          <h1 className="text-2xl font-bold flex-1">{recipe.nombre}</h1>
          <FavoriteButton recipeId={recipe.id} isFavorite={recipe.favorito} />
        </div>

        <div className="flex flex-wrap gap-1.5 mt-3">
          {recipe.categoria.map((cat) => (
            <span key={cat} className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary font-medium">
              {cat}
            </span>
          ))}
          {recipe.tipo.map((t) => (
            <span key={t} className="text-xs px-2.5 py-1 rounded-full bg-gray-100 text-text-muted font-medium">
              {t}
            </span>
          ))}
        </div>

        <div className="flex gap-4 mt-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-text-muted">Iván:</span>
            <RatingBadge rating={recipe.nivelIvan} />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-text-muted">Vero:</span>
            <RatingBadge rating={recipe.nivelVero} />
          </div>
          {recipe.tiempoPreparacion && (
            <span className="text-sm text-text-muted ml-auto">
              ⏱ {recipe.tiempoPreparacion} min
            </span>
          )}
        </div>

        {recipe.observaciones && (
          <div className="mt-4 bg-warning/10 rounded-xl px-4 py-3">
            <p className="text-sm text-warning font-medium">💡 Observaciones</p>
            <p className="text-sm mt-1 whitespace-pre-wrap">{recipe.observaciones}</p>
          </div>
        )}

        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-2">Ingredientes</h2>
          <div className="bg-bg rounded-xl px-4 py-3 text-sm whitespace-pre-wrap leading-relaxed">
            {recipe.ingredientes || 'Sin ingredientes registrados'}
          </div>
        </div>

        {recipe.instrucciones && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-2">Instrucciones</h2>
            <div className="bg-bg rounded-xl px-4 py-3 text-sm whitespace-pre-wrap leading-relaxed">
              {recipe.instrucciones}
            </div>
          </div>
        )}

        {recipe.fotos && recipe.fotos.length > 1 && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-2">Galería</h2>
            <div className="grid grid-cols-2 gap-2">
              {recipe.fotos.slice(1).map((url, i) => (
                <img
                  key={i}
                  src={url}
                  alt={`${recipe.nombre} ${i + 2}`}
                  className="w-full h-32 object-cover rounded-xl"
                />
              ))}
            </div>
          </div>
        )}

        {recipe.link && (
          <a
            href={recipe.link}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 flex items-center gap-2 text-sm text-primary hover:underline"
          >
            🔗 Ver receta original / vídeo
          </a>
        )}

        <div className="flex gap-3 mt-6 pt-4 border-t border-border">
          <button
            onClick={() => router.push(`/receta/${recipe.id}/editar`)}
            className="flex-1 rounded-xl bg-primary text-white py-2.5 text-sm font-semibold hover:bg-primary-dark active:scale-95"
          >
            ✏️ Editar
          </button>
          <button
            onClick={handleDelete}
            className="rounded-xl bg-danger/10 text-danger px-4 py-2.5 text-sm font-semibold hover:bg-danger/20 active:scale-95"
          >
            🗑️
          </button>
        </div>
        </div>
      </div>
    </div>
  );
}
