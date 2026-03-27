'use client';

import Link from 'next/link';
import type { Recipe } from '../_lib/types';
import RatingBadge from './RatingBadge';
import FavoriteButton from './FavoriteButton';
import RecipeImage from './RecipeImage';

export default function RecipeCard({ recipe }: { recipe: Recipe }) {
  return (
    <Link
      href={`/receta/${recipe.id}`}
      className="block bg-bg-card rounded-xl border border-border shadow-sm hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] overflow-hidden"
    >
      <RecipeImage
        src={recipe.fotos?.[0]}
        nombre={recipe.nombre}
        size="md"
      />

      <div className="p-4">
        <div className="flex justify-between items-start gap-2">
          <h3 className="font-semibold text-base leading-tight flex-1">
            {recipe.nombre}
          </h3>
          <FavoriteButton recipeId={recipe.id} isFavorite={recipe.favorito} />
        </div>

        <div className="flex flex-wrap gap-1.5 mt-2">
          {recipe.categoria.map((cat) => (
            <span key={cat} className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
              {cat}
            </span>
          ))}
          {recipe.tipo.map((t) => (
            <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-text-muted font-medium">
              {t}
            </span>
          ))}
        </div>

        <div className="flex items-center gap-3 mt-3">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-text-muted">Iván:</span>
            <RatingBadge rating={recipe.nivelIvan} />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-text-muted">Vero:</span>
            <RatingBadge rating={recipe.nivelVero} />
          </div>
          {recipe.tiempoPreparacion && (
            <span className="text-xs text-text-muted ml-auto">
              {recipe.tiempoPreparacion} min
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
