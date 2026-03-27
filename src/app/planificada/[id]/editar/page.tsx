'use client';

import { useState, useEffect, use } from 'react';
import type { PlannedRecipe } from '../../../_lib/types';
import PlannedRecipeForm from '../../../_components/PlannedRecipeForm';

export default function EditarPlanificada({
  params,
}: {
  params: Promise<{ id: string }> | { id: string };
}) {
  const { id } = params instanceof Promise ? use(params) : params;
  const [recipe, setRecipe] = useState<PlannedRecipe | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/planned/${id}`)
      .then((r) => r.json())
      .then(setRecipe)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

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
    <div>
      <h1 className="text-2xl font-bold mb-6">Editar Receta Planificada</h1>
      <PlannedRecipeForm initial={recipe} mode="edit" />
    </div>
  );
}
