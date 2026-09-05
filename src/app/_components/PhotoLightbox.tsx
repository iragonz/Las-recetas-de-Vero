'use client';

import { useEffect, useRef, useState } from 'react';

interface PhotoLightboxProps {
  fotos: string[];
  index: number;
  nombre: string;
  onClose: () => void;
}

export default function PhotoLightbox({ fotos, index, nombre, onClose }: PhotoLightboxProps) {
  const [current, setCurrent] = useState(index);
  const touchStartX = useRef<number | null>(null);

  const total = fotos.length;

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') setCurrent((c) => (c + 1) % total);
      if (e.key === 'ArrowLeft') setCurrent((c) => (c - 1 + total) % total);
    }
    window.addEventListener('keydown', onKey);
    // Evita que la página de detrás haga scroll mientras el visor está abierto
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [total, onClose]);

  if (total === 0) return null;

  function go(delta: number) {
    setCurrent((c) => (c + delta + total) % total);
  }

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(dx) < 50) return;
    go(dx < 0 ? 1 : -1);
  }

  return (
    <div
      className="fixed inset-0 z-[60] bg-black/95 flex flex-col"
      onClick={onClose}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="flex items-center justify-between px-4 py-3 text-white shrink-0">
        <span className="text-sm font-medium opacity-80">
          {total > 1 ? `${current + 1} / ${total}` : nombre}
        </span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-xl active:scale-90"
        >
          ✕
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center px-2 pb-4 min-h-0">
        <img
          src={fotos[current]}
          alt={`${nombre} ${current + 1}`}
          onClick={(e) => e.stopPropagation()}
          className="max-h-full max-w-full object-contain select-none"
        />
      </div>

      {total > 1 && (
        <>
          <button
            type="button"
            aria-label="Anterior"
            onClick={(e) => { e.stopPropagation(); go(-1); }}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 text-white text-xl flex items-center justify-center active:scale-90"
          >
            ‹
          </button>
          <button
            type="button"
            aria-label="Siguiente"
            onClick={(e) => { e.stopPropagation(); go(1); }}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 text-white text-xl flex items-center justify-center active:scale-90"
          >
            ›
          </button>
        </>
      )}
    </div>
  );
}
