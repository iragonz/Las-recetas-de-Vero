'use client';

import Link from 'next/link';
import type { PlannedRecipe } from '../_lib/types';
import RecipeImage from './RecipeImage';

export default function PlannedRecipeCard({ recipe }: { recipe: PlannedRecipe }) {
  return (
    <Link
      href={`/planificada/${recipe.id}`}
      className="block bg-bg-card rounded-xl border border-border shadow-sm hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] overflow-hidden"
    >
      <RecipeImage
        src={recipe.fotos?.[0]}
        nombre={recipe.nombre}
        size="md"
      />

      <div className="p-4">
        <h3 className="font-semibold text-base leading-tight">
          {recipe.nombre}
        </h3>

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

        {recipe.link && (
          <span className="text-[10px] text-primary mt-2 block">🔗 Tiene enlace</span>
        )}
      </div>
    </Link>
  );
}
