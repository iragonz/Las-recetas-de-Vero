'use client';

import Link from 'next/link';
import type { Recipe } from '../_lib/types';
import RatingBadge from './RatingBadge';
import RecipeImage from './RecipeImage';

export default function RecipeListItem({ recipe }: { recipe: Recipe }) {
  return (
    <Link
      href={`/receta/${recipe.id}`}
      className="flex items-center gap-3 bg-bg-card rounded-xl border border-border px-3 py-2 hover:shadow-sm active:scale-[0.99]"
    >
      <RecipeImage
        src={recipe.fotos?.[0]}
        nombre={recipe.nombre}
        size="sm"
        className="rounded-lg shrink-0"
      />

      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-sm truncate">
          {recipe.favorito && <span className="mr-1">❤️</span>}
          {recipe.nombre}
        </h3>
        <div className="flex flex-wrap gap-1 mt-0.5">
          {recipe.categoria.map((cat) => (
            <span key={cat} className="text-[9px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
              {cat}
            </span>
          ))}
          {recipe.tipo.slice(0, 2).map((t) => (
            <span key={t} className="text-[9px] px-1.5 py-0.5 rounded-full bg-gray-100 text-text-muted font-medium">
              {t}
            </span>
          ))}
          {recipe.tipo.length > 2 && (
            <span className="text-[9px] text-text-muted">+{recipe.tipo.length - 2}</span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <RatingBadge rating={recipe.nivelIvan} />
        <RatingBadge rating={recipe.nivelVero} />
        {recipe.tiempoPreparacion && (
          <span className="text-[10px] text-text-muted whitespace-nowrap">
            {recipe.tiempoPreparacion}m
          </span>
        )}
      </div>
    </Link>
  );
}
