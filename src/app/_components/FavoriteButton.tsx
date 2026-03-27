'use client';

import { useState } from 'react';

export default function FavoriteButton({
  recipeId,
  isFavorite,
}: {
  recipeId: string;
  isFavorite: boolean;
}) {
  const [fav, setFav] = useState(isFavorite);
  const [loading, setLoading] = useState(false);

  async function toggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setLoading(true);
    try {
      await fetch(`/api/recipes/${recipeId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ favorito: !fav }),
      });
      setFav(!fav);
    } catch (err) {
      console.error('Error toggling favorite:', err);
    }
    setLoading(false);
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`text-xl shrink-0 ${loading ? 'opacity-50' : 'hover:scale-110 active:scale-95'}`}
      aria-label={fav ? 'Quitar de favoritos' : 'Añadir a favoritos'}
    >
      {fav ? '❤️' : '🤍'}
    </button>
  );
}
