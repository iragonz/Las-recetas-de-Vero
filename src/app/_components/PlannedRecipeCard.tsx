'use client';

import Link from 'next/link';
import type { PlannedRecipe } from '../_lib/types';
import RecipeImage from './RecipeImage';

export default function PlannedRecipeCard({ recipe }: { recipe: PlannedRecipe }) {
  return (
    <Link
      href={`/planificada/${recipe.id}`}
      className="block bg-bg-card rounded-2xl border border-border/60 shadow-sm card-glow hover:-translate-y-1 active:scale-[0.98] overflow-hidden"
    >
      <RecipeImage
        src={recipe.fotos?.[0]}
        nombre={recipe.nombre}
        size="md"
      />

      <div className="p-4">
        <h3 className="font-semibold text-[15px] leading-tight">
          {recipe.nombre}
        </h3>

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

        {recipe.link && (
          <span className="text-[10px] text-primary mt-2.5 block font-medium">&#128279; Tiene enlace</span>
        )}
      </div>
    </Link>
  );
}
