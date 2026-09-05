'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Recipe, NivelGusto } from '../_lib/types';
import { useOptions } from '../_lib/useOptions';
import { normalizeLink } from '../_lib/link';

interface RecipeFormProps {
  initial?: Recipe;
  mode: 'create' | 'edit';
}

export default function RecipeForm({ initial, mode }: RecipeFormProps) {
  const router = useRouter();
  const options = useOptions().hechas;
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [nombre, setNombre] = useState(initial?.nombre ?? '');
  const [ingredientes, setIngredientes] = useState(initial?.ingredientes ?? '');
  const [instrucciones, setInstrucciones] = useState(initial?.instrucciones ?? '');
  const [fotos, setFotos] = useState<string[]>(initial?.fotos ?? []);
  const [newFotoUrl, setNewFotoUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [link, setLink] = useState(initial?.link ?? '');
  const [observaciones, setObservaciones] = useState(initial?.observaciones ?? '');
  const [tiempoPreparacion, setTiempoPreparacion] = useState<string>(
    initial?.tiempoPreparacion?.toString() ?? ''
  );
  const [nivelIvan, setNivelIvan] = useState<NivelGusto>(initial?.nivelIvan ?? '');
  const [nivelVero, setNivelVero] = useState<NivelGusto>(initial?.nivelVero ?? '');
  const [categorias, setCategorias] = useState<string[]>(initial?.categoria ?? []);
  const [tipos, setTipos] = useState<string[]>(initial?.tipo ?? []);
  const [favorito, setFavorito] = useState(initial?.favorito ?? false);

  function toggleArrayItem(arr: string[], item: string): string[] {
    return arr.includes(item) ? arr.filter((i) => i !== item) : [...arr, item];
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const form = new FormData();
      form.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: form });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error || 'No se pudo subir la imagen');
      setFotos((prev) => [...prev, data.url]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al subir la imagen');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nombre.trim()) return;
    setSaving(true);
    setError('');

    const data = {
      nombre: nombre.trim(),
      categoria: categorias,
      favorito,
      ingredientes,
      instrucciones,
      fotos,
      link: normalizeLink(link),
      nivelIvan,
      nivelVero,
      observaciones,
      tiempoPreparacion: tiempoPreparacion ? parseInt(tiempoPreparacion) : null,
      tipo: tipos,
    };

    try {
      if (mode === 'create') {
        const res = await fetch('/api/recipes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        const recipe = await res.json();
        if (!res.ok || !recipe?.id) throw new Error(recipe?.error || 'No se pudo crear la receta');
        router.push(`/receta/${recipe.id}`);
      } else {
        const res = await fetch(`/api/recipes/${initial!.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        const result = await res.json();
        if (!res.ok) throw new Error(result?.error || 'No se pudieron guardar los cambios');
        router.push(`/receta/${initial!.id}`);
      }
    } catch (err) {
      console.error('Error saving recipe:', err);
      setError(err instanceof Error ? err.message : 'Error al guardar la receta');
      setSaving(false);
    }
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
          <div className="flex flex-wrap gap-3 mb-3">
            {fotos.map((url, i) => (
              <div key={i} className="relative">
                <img src={url} alt={`Foto ${i + 1}`} className={`h-20 w-20 object-cover rounded-lg border-2 ${i === 0 ? 'border-primary' : 'border-border'}`} />
                {i === 0 ? (
                  <span className="absolute bottom-0.5 left-0.5 text-[9px] bg-primary text-white px-1.5 py-0.5 rounded font-medium">Principal</span>
                ) : (
                  <button
                    type="button"
                    title="Hacer principal"
                    aria-label="Hacer foto principal"
                    onClick={() => setFotos([url, ...fotos.filter((_, j) => j !== i)])}
                    className="absolute bottom-0.5 left-0.5 bg-black/60 text-white rounded-full w-7 h-7 text-sm flex items-center justify-center active:scale-90 hover:bg-primary"
                  >
                    ★
                  </button>
                )}
                <button
                  type="button"
                  title="Quitar foto"
                  aria-label="Quitar foto"
                  onClick={() => setFotos(fotos.filter((_, j) => j !== i))}
                  className="absolute -top-2 -right-2 bg-danger text-white rounded-full w-7 h-7 text-sm flex items-center justify-center shadow active:scale-90"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <label className={`flex-1 justify-center rounded-xl bg-primary text-white px-4 py-2.5 text-sm font-medium hover:bg-primary-dark active:scale-95 cursor-pointer flex items-center gap-1.5 ${uploading ? 'opacity-60 pointer-events-none' : ''}`}>
            📷 Cámara
            <input
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              disabled={uploading}
              onChange={handleUpload}
            />
          </label>
          <label className={`flex-1 justify-center rounded-xl bg-primary/10 text-primary px-4 py-2.5 text-sm font-medium hover:bg-primary/20 active:scale-95 cursor-pointer flex items-center gap-1.5 ${uploading ? 'opacity-60 pointer-events-none' : ''}`}>
            🖼️ Galería
            <input
              type="file"
              accept="image/*"
              className="hidden"
              disabled={uploading}
              onChange={handleUpload}
            />
          </label>
        </div>
        {uploading && (
          <p className="flex items-center gap-2 text-xs text-text-muted mt-2">
            <span className="animate-spin h-3.5 w-3.5 border-2 border-primary border-t-transparent rounded-full" />
            Subiendo foto...
          </p>
        )}
        <div className="flex gap-2 mt-2">
          <input
            type="text"
            inputMode="url"
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
        <p className="text-[10px] text-text-muted mt-1">La primera foto es la principal. Toca ★ en cualquier otra para ponerla de principal, o ✕ para quitarla.</p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Categoría</label>
        <div className="flex flex-wrap gap-2">
          {options.categorias.map((cat) => (
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
          {options.tipos.map((t) => (
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

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Nivel Iván</label>
          <select
            value={nivelIvan}
            onChange={(e) => setNivelIvan(e.target.value as NivelGusto)}
            className="w-full rounded-xl border border-border bg-bg-card px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="">Sin valorar</option>
            {options.nivelIvan.map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Nivel Vero</label>
          <select
            value={nivelVero}
            onChange={(e) => setNivelVero(e.target.value as NivelGusto)}
            className="w-full rounded-xl border border-border bg-bg-card px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="">Sin valorar</option>
            {options.nivelVero.map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Tiempo (min)</label>
        <input
          type="number"
          value={tiempoPreparacion}
          onChange={(e) => setTiempoPreparacion(e.target.value)}
          className="w-32 rounded-xl border border-border bg-bg-card px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Link / Vídeo <span className="text-text-muted font-normal">(opcional)</span></label>
        <input
          type="text"
          inputMode="url"
          value={link}
          onChange={(e) => setLink(e.target.value)}
          className="w-full rounded-xl border border-border bg-bg-card px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          placeholder="https://... o déjalo vacío"
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

      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={favorito}
          onChange={(e) => setFavorito(e.target.checked)}
          className="w-4 h-4 accent-primary"
        />
        <span className="text-sm">❤️ Marcar como favorita</span>
      </label>

      {error && (
        <div className="flex items-start gap-2 text-sm text-danger bg-danger/5 rounded-xl px-3 py-2.5">
          <span>⚠️</span>
          <span className="break-words">{error}</span>
        </div>
      )}

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
