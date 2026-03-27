'use client';

import { useState } from 'react';
import RecipeForm from '../../_components/RecipeForm';
import AIRecipeInput from '../../_components/AIRecipeInput';

export default function NuevaReceta() {
  const [aiMode, setAiMode] = useState<'photo' | 'voice' | 'text' | null>(null);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Nueva Receta</h1>

      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setAiMode(null)}
          className={`rounded-lg px-4 py-2 text-sm font-medium border ${
            aiMode === null ? 'bg-primary text-white border-primary' : 'bg-bg-card border-border text-text-muted'
          }`}
        >
          ✏️ Manual
        </button>
        <button
          onClick={() => setAiMode('photo')}
          className={`rounded-lg px-4 py-2 text-sm font-medium border ${
            aiMode === 'photo' ? 'bg-primary text-white border-primary' : 'bg-bg-card border-border text-text-muted'
          }`}
        >
          📸 Desde foto
        </button>
        <button
          onClick={() => setAiMode('voice')}
          className={`rounded-lg px-4 py-2 text-sm font-medium border ${
            aiMode === 'voice' ? 'bg-primary text-white border-primary' : 'bg-bg-card border-border text-text-muted'
          }`}
        >
          🎤 Por voz
        </button>
        <button
          onClick={() => setAiMode('text')}
          className={`rounded-lg px-4 py-2 text-sm font-medium border ${
            aiMode === 'text' ? 'bg-primary text-white border-primary' : 'bg-bg-card border-border text-text-muted'
          }`}
        >
          📋 Desde texto IA
        </button>
      </div>

      {aiMode === null ? (
        <RecipeForm mode="create" />
      ) : (
        <AIRecipeInput mode={aiMode} />
      )}
    </div>
  );
}
