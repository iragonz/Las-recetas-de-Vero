'use client';

import type { Recipe } from '../_lib/types';

export default function RandomRecipeButton({
  recipes,
}: {
  recipes: Recipe[];
}) {
  function pickRandom() {
    if (recipes.length === 0) return;
    const recipe = recipes[Math.floor(Math.random() * recipes.length)];
    window.location.href = `/receta/${recipe.id}`;
  }

  return (
    <button
      onClick={pickRandom}
      disabled={recipes.length === 0}
      className="flex items-center gap-2 rounded-xl bg-primary text-white px-4 py-2.5 text-sm font-semibold shadow-md hover:bg-primary-dark active:scale-95 disabled:opacity-50"
    >
      🎲 ¿Qué comemos hoy?
    </button>
  );
}
