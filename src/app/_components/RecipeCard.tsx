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
      className="block bg-bg-card rounded-2xl border border-border/60 shadow-sm card-glow hover:-translate-y-1 active:scale-[0.98] overflow-hidden"
    >
      <RecipeImage
        src={recipe.fotos?.[0]}
        nombre={recipe.nombre}
        size="md"
      />

      <div className="p-4">
        <div className="flex justify-between items-start gap-2">
          <h3 className="font-semibold text-[15px] leading-tight flex-1">
            {recipe.nombre}
          </h3>
          <FavoriteButton recipeId={recipe.id} isFavorite={recipe.favorito} />
        </div>

        <div className="flex flex-wrap gap-1.5 mt-2.5">
          {recipe.categoria.map((cat) => (
            <span key={cat} className="text-[10px] px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
              {cat}
            </span>
          ))}
          {recipe.tipo.map((t) => (
            <span key={t} className="text-[10px] px-2.5 py-0.5 rounded-full bg-bg-warm text-text-muted font-medium">
              {t}
            </span>
          ))}
        </div>

        <div className="flex items-center gap-3 mt-3 pt-3 border-t border-border/40">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-text-muted">I:</span>
            <RatingBadge rating={recipe.nivelIvan} />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-text-muted">V:</span>
            <RatingBadge rating={recipe.nivelVero} />
          </div>
          {recipe.tiempoPreparacion && (
            <span className="text-[10px] text-text-muted ml-auto">
              &#9201; {recipe.tiempoPreparacion} min
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
