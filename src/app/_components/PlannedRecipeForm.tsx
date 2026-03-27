'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { PlannedRecipe } from '../_lib/types';
import { CATEGORIAS, TIPOS } from '../_lib/types';

interface PlannedRecipeFormProps {
  initial?: PlannedRecipe;
  mode: 'create' | 'edit';
}

export default function PlannedRecipeForm({ initial, mode }: PlannedRecipeFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const [nombre, setNombre] = useState(initial?.nombre ?? '');
  const [ingredientes, setIngredientes] = useState(initial?.ingredientes ?? '');
  const [instrucciones, setInstrucciones] = useState(initial?.instrucciones ?? '');
  const [fotos, setFotos] = useState<string[]>(initial?.fotos ?? []);
  const [newFotoUrl, setNewFotoUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [link, setLink] = useState(initial?.link ?? '');
  const [observaciones, setObservaciones] = useState(initial?.observaciones ?? '');
  const [categorias, setCategorias] = useState<string[]>(initial?.categoria ?? []);
  const [tipos, setTipos] = useState<string[]>(initial?.tipo ?? []);

  function toggleArrayItem(arr: string[], item: string): string[] {
    return arr.includes(item) ? arr.filter((i) => i !== item) : [...arr, item];
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nombre.trim()) return;
    setSaving(true);

    const data = {
      nombre: nombre.trim(),
      categoria: categorias,
      ingredientes,
      instrucciones,
      fotos,
      link: link.trim(),
      observaciones,
      tipo: tipos,
    };

    try {
      if (mode === 'create') {
        const res = await fetch('/api/planned', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        const recipe = await res.json();
        router.push(`/planificada/${recipe.id}`);
      } else {
        await fetch(`/api/planned/${initial!.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        router.push(`/planificada/${initial!.id}`);
      }
    } catch (err) {
      console.error('Error saving planned recipe:', err);
      alert('Error al guardar la receta');
    }
    setSaving(false);
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-5">
      <div>
        <label className="block text-sm font-medium mb-1">Nombre *</label>
        <input
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
          className="w-full rounded-xl border border-border bg-bg-card px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Ingredientes</label>
        <textarea
          value={ingredientes}
          onChange={(e) => setIngredientes(e.target.value)}
          rows={8}
          className="w-full rounded-xl border border-border bg-bg-card px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          placeholder="- ingrediente 1&#10;- ingrediente 2&#10;..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Instrucciones</label>
        <textarea
          value={instrucciones}
          onChange={(e) => setInstrucciones(e.target.value)}
          rows={8}
          className="w-full rounded-xl border border-border bg-bg-card px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          placeholder="1. Paso uno&#10;2. Paso dos&#10;..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Fotos</label>
        {fotos.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {fotos.map((url, i) => (
              <div key={i} className="relative group">
                <img src={url} alt={`Foto ${i + 1}`} className={`h-20 w-20 object-cover rounded-lg border-2 ${i === 0 ? 'border-primary' : 'border-border'}`} />
                {i === 0 ? (
                  <span className="absolute top-0.5 left-0.5 text-[8px] bg-primary text-white px-1 rounded">Principal</span>
                ) : (
                  <button
                    type="button"
                    title="Hacer principal"
                    onClick={() => {
                      const reordered = [url, ...fotos.filter((_, j) => j !== i)];
                      setFotos(reordered);
                    }}
                    className="absolute top-0.5 left-0.5 bg-black/50 text-white rounded w-5 h-5 text-[10px] flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-primary"
                  >
                    ★
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setFotos(fotos.filter((_, j) => j !== i))}
                  className="absolute -top-1.5 -right-1.5 bg-danger text-white rounded-full w-5 h-5 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100"
                >
                  x
                </button>
              </div>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <label className="rounded-xl bg-primary text-white px-4 py-2 text-sm font-medium hover:bg-primary-dark active:scale-95 cursor-pointer flex items-center gap-1.5">
            {uploading ? (
              <>
                <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                Subiendo...
              </>
            ) : (
              <>📷 Subir foto</>
            )}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              disabled={uploading}
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                setUploading(true);
                try {
                  const form = new FormData();
                  form.append('file', file);
                  const res = await fetch('/api/upload', { method: 'POST', body: form });
                  const data = await res.json();
                  if (data.url) {
                    setFotos([...fotos, data.url]);
                  } else {
                    alert(data.error || 'Error al subir imagen');
                  }
                } catch {
                  alert('Error al subir imagen');
                } finally {
                  setUploading(false);
                  e.target.value = '';
                }
              }}
            />
          </label>
        </div>
        <div className="flex gap-2 mt-2">
          <input
            type="url"
            value={newFotoUrl}
            onChange={(e) => setNewFotoUrl(e.target.value)}
            placeholder="...o pega URL de imagen"
            className="flex-1 rounded-xl border border-border bg-bg-card px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <button
            type="button"
            onClick={() => {
              if (newFotoUrl.trim()) {
                setFotos([...fotos, newFotoUrl.trim()]);
                setNewFotoUrl('');
              }
            }}
            className="rounded-xl bg-primary/10 text-primary px-4 py-2 text-sm font-medium hover:bg-primary/20"
          >
            Añadir
          </button>
        </div>
        <p className="text-[10px] text-text-muted mt-1">La primera foto será la imagen principal.</p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Categoría</label>
        <div className="flex flex-wrap gap-2">
          {CATEGORIAS.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategorias(toggleArrayItem(categorias, cat))}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium border ${
                categorias.includes(cat)
                  ? 'bg-primary text-white border-primary'
                  : 'bg-bg-card border-border text-text-muted hover:border-primary'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Tipo</label>
        <div className="flex flex-wrap gap-2">
          {TIPOS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTipos(toggleArrayItem(tipos, t))}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium border ${
                tipos.includes(t)
                  ? 'bg-primary text-white border-primary'
                  : 'bg-bg-card border-border text-text-muted hover:border-primary'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Link / Vídeo</label>
        <input
          type="url"
          value={link}
          onChange={(e) => setLink(e.target.value)}
          className="w-full rounded-xl border border-border bg-bg-card px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          placeholder="https://..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Observaciones</label>
        <textarea
          value={observaciones}
          onChange={(e) => setObservaciones(e.target.value)}
          rows={3}
          className="w-full rounded-xl border border-border bg-bg-card px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={saving || !nombre.trim()}
          className="flex-1 rounded-xl bg-primary text-white py-3 text-sm font-semibold hover:bg-primary-dark active:scale-95 disabled:opacity-50"
        >
          {saving ? 'Guardando...' : mode === 'create' ? '✨ Crear receta' : '💾 Guardar cambios'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-xl bg-gray-100 text-text-muted px-6 py-3 text-sm font-medium hover:bg-gray-200 active:scale-95"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
