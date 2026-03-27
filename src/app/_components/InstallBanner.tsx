'use client';

import { useState, useEffect, useRef } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function InstallBanner() {
  const [show, setShow] = useState(false);
  const deferredPrompt = useRef<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    // Don't show if already installed (standalone mode)
    if (window.matchMedia('(display-mode: standalone)').matches) return;

    // Don't show if user dismissed before
    if (localStorage.getItem('install-dismissed')) return;

    function handler(e: Event) {
      e.preventDefault();
      deferredPrompt.current = e as BeforeInstallPromptEvent;
      setShow(true);
    }

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  async function handleInstall() {
    if (!deferredPrompt.current) return;
    deferredPrompt.current.prompt();
    const { outcome } = await deferredPrompt.current.userChoice;
    if (outcome === 'accepted') {
      setShow(false);
    }
    deferredPrompt.current = null;
  }

  function handleDismiss() {
    setShow(false);
    localStorage.setItem('install-dismissed', '1');
  }

  if (!show) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-primary to-accent text-white px-4 py-3 shadow-lg">
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
        <p className="text-sm font-medium">
          Instala Las Recetas de Vero en tu dispositivo
        </p>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={handleInstall}
            className="rounded-lg bg-white text-primary px-3 py-1.5 text-xs font-semibold hover:bg-white/90 active:scale-95"
          >
            Instalar
          </button>
          <button
            onClick={handleDismiss}
            className="rounded-lg bg-white/20 px-2.5 py-1.5 text-xs font-medium hover:bg-white/30 active:scale-95"
          >
            Ahora no
          </button>
        </div>
      </div>
    </div>
  );
}
