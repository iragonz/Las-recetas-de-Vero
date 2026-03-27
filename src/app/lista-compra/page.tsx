'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import type { Recipe, ShoppingItem } from '../_lib/types';

const STORAGE_KEY = 'recetario-shopping-list';

function ShoppingListContent() {
  const searchParams = useSearchParams();
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [newItem, setNewItem] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) setItems(JSON.parse(saved));

    fetch('/api/recipes')
      .then((r) => r.json())
      .then((data: Recipe[]) => {
        setRecipes(data);

        const ids = searchParams.get('ids')?.split(',').filter(Boolean);
        if (ids && ids.length > 0) {
          const selectedRecipes = data.filter((r: Recipe) => ids.includes(r.id));
          const newItems = selectedRecipes.flatMap((r: Recipe) =>
            parseIngredients(r.ingredientes).map((text) => ({
              id: crypto.randomUUID(),
              text: `${text} (${r.nombre})`,
              checked: false,
            }))
          );
          if (newItems.length > 0) {
            setItems((prev) => {
              const merged = [...prev, ...newItems];
              localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
              return merged;
            });
          }
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
    // Only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function parseIngredients(text: string): string[] {
    return text
      .split('\n')
      .map((line) => line.replace(/^[-•️🔹▪️]\s*/, '').trim())
      .filter((line) => line.length > 0 && line.length < 200);
  }

  function saveItems(newItems: ShoppingItem[]) {
    setItems(newItems);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newItems));
  }

  function addItem() {
    if (!newItem.trim()) return;
    saveItems([...items, { id: crypto.randomUUID(), text: newItem.trim(), checked: false }]);
    setNewItem('');
  }

  function toggleItem(id: string) {
    saveItems(items.map((i) => (i.id === id ? { ...i, checked: !i.checked } : i)));
  }

  function removeItem(id: string) {
    saveItems(items.filter((i) => i.id !== id));
  }

  function clearChecked() {
    saveItems(items.filter((i) => !i.checked));
  }

  function clearAll() {
    if (confirm('¿Limpiar toda la lista?')) saveItems([]);
  }

  function addFromRecipe(recipe: Recipe) {
    const newItems = parseIngredients(recipe.ingredientes).map((text) => ({
      id: crypto.randomUUID(),
      text,
      checked: false,
    }));
    saveItems([...items, ...newItems]);
  }

  const [showRecipes, setShowRecipes] = useState(false);
  const unchecked = items.filter((i) => !i.checked);
  const checked = items.filter((i) => i.checked);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin h-8 w-8 border-3 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">🛒 Lista de la Compra</h1>
        <div className="flex gap-2">
          {checked.length > 0 && (
            <button onClick={clearChecked} className="text-xs text-text-muted hover:text-primary">
              Limpiar tachados
            </button>
          )}
          {items.length > 0 && (
            <button onClick={clearAll} className="text-xs text-text-muted hover:text-danger">
              Limpiar todo
            </button>
          )}
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addItem()}
          placeholder="Añadir artículo..."
          className="flex-1 rounded-xl border border-border bg-bg-card px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
        <button
          onClick={addItem}
          className="rounded-xl bg-primary text-white px-4 py-2.5 text-sm font-semibold hover:bg-primary-dark active:scale-95"
        >
          +
        </button>
      </div>

      <button
        onClick={() => setShowRecipes(!showRecipes)}
        className="mb-4 text-sm text-primary hover:underline"
      >
        {showRecipes ? 'Ocultar recetas' : '+ Añadir ingredientes de una receta'}
      </button>

      {showRecipes && (
        <div className="mb-4 max-h-48 overflow-y-auto bg-bg-card rounded-xl border border-border p-2 space-y-1">
          {recipes.map((r) => (
            <button
              key={r.id}
              onClick={() => addFromRecipe(r)}
              className="w-full text-left rounded-lg px-3 py-1.5 text-xs hover:bg-primary/5"
            >
              {r.nombre}
            </button>
          ))}
        </div>
      )}

      {unchecked.length === 0 && checked.length === 0 ? (
        <p className="text-center py-20 text-text-muted">
          La lista está vacía. Añade artículos o genera la lista desde el planificador.
        </p>
      ) : (
        <div className="space-y-1">
          {unchecked.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3 bg-bg-card rounded-lg px-3 py-2 border border-border"
            >
              <button
                onClick={() => toggleItem(item.id)}
                className="w-5 h-5 rounded border-2 border-border shrink-0 hover:border-primary"
              />
              <span className="text-sm flex-1">{item.text}</span>
              <button
                onClick={() => removeItem(item.id)}
                className="text-xs text-text-muted hover:text-danger shrink-0"
              >
                ✕
              </button>
            </div>
          ))}

          {checked.length > 0 && (
            <>
              <p className="text-xs text-text-muted pt-3 pb-1">
                Tachados ({checked.length})
              </p>
              {checked.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 bg-bg-card/50 rounded-lg px-3 py-2 border border-border"
                >
                  <button
                    onClick={() => toggleItem(item.id)}
                    className="w-5 h-5 rounded border-2 border-success bg-success shrink-0 flex items-center justify-center"
                  >
                    <span className="text-white text-xs">✓</span>
                  </button>
                  <span className="text-sm flex-1 line-through text-text-muted">{item.text}</span>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-xs text-text-muted hover:text-danger shrink-0"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default function ListaCompra() {
  return (
    <Suspense fallback={
      <div className="flex justify-center py-20">
        <div className="animate-spin h-8 w-8 border-3 border-primary border-t-transparent rounded-full" />
      </div>
    }>
      <ShoppingListContent />
    </Suspense>
  );
}
