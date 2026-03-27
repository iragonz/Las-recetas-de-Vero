'use client';

import PlannedRecipeForm from '../../_components/PlannedRecipeForm';

export default function NuevaPlanificada() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Nueva Receta Planificada</h1>
      <PlannedRecipeForm mode="create" />
    </div>
  );
}
