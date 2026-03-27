'use client';

import { useState, useRef } from 'react';
import RecipeForm from './RecipeForm';
import type { Recipe } from '../_lib/types';

interface AIRecipeInputProps {
  mode: 'photo' | 'voice' | 'text';
}

export default function AIRecipeInput({ mode }: AIRecipeInputProps) {
  const [loading, setLoading] = useState(false);
  const [generatedRecipe, setGeneratedRecipe] = useState<Omit<Recipe, 'id'> | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [pastedText, setPastedText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  async function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = (reader.result as string).split(',')[1];
      try {
        const res = await fetch('/api/gemini', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'photo-to-recipe',
            data: { base64, mimeType: file.type },
          }),
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        setGeneratedRecipe({
          ...data,
          favorito: false,
          nivelIvan: '',
          nivelVero: '',
          link: '',
          observaciones: data.observaciones || '',
          tiempoPreparacion: data.tiempoPreparacion || null,
        });
      } catch (err) {
        console.error(err);
        alert('Error al procesar la imagen');
      }
      setLoading(false);
    };
    reader.readAsDataURL(file);
  }

  function startRecording() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Tu navegador no soporta reconocimiento de voz');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'es-ES';
    recognition.continuous = true;
    recognition.interimResults = true;

    let finalText = '';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalText += event.results[i][0].transcript + ' ';
        } else {
          interim += event.results[i][0].transcript;
        }
      }
      setTranscript(finalText + interim);
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsRecording(false);
    };

    recognition.onend = () => setIsRecording(false);

    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
  }

  function stopRecording() {
    recognitionRef.current?.stop();
    setIsRecording(false);
  }

  async function processVoice() {
    if (!transcript.trim()) return;
    setLoading(true);
    try {
      const res = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'voice-to-recipe',
          data: { text: transcript },
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setGeneratedRecipe({
        ...data,
        favorito: false,
        nivelIvan: '',
        nivelVero: '',
        link: '',
        observaciones: data.observaciones || '',
        tiempoPreparacion: data.tiempoPreparacion || null,
      });
    } catch (err) {
      console.error(err);
      alert('Error al procesar la voz');
    }
    setLoading(false);
  }

  async function processText() {
    if (!pastedText.trim()) return;
    setLoading(true);
    try {
      const res = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'text-to-recipe',
          data: { text: pastedText },
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setGeneratedRecipe({
        ...data,
        favorito: false,
        nivelIvan: '',
        nivelVero: '',
        link: '',
        fotos: [],
        instrucciones: data.instrucciones || pastedText,
        observaciones: data.observaciones || '',
        tiempoPreparacion: data.tiempoPreparacion || null,
      });
    } catch (err) {
      console.error(err);
      alert('Error al procesar el texto');
    }
    setLoading(false);
  }

  if (generatedRecipe) {
    return (
      <div>
        <div className="bg-success/10 rounded-xl px-4 py-3 mb-4">
          <p className="text-sm text-success font-medium">
            ✨ Receta generada por IA. Revisa y ajusta antes de guardar.
          </p>
        </div>
        <RecipeForm
          initial={{ id: '', ...generatedRecipe } as Recipe}
          mode="create"
        />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="animate-spin h-10 w-10 border-3 border-primary border-t-transparent rounded-full" />
        <p className="text-sm text-text-muted">
          {mode === 'photo' ? 'Analizando imagen...' : mode === 'text' ? 'Extrayendo receta del texto...' : 'Procesando texto...'}
        </p>
      </div>
    );
  }

  if (mode === 'photo') {
    return (
      <div className="flex flex-col items-center gap-4 py-10">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-primary/40 bg-primary/5 px-12 py-10 hover:bg-primary/10 active:scale-95"
        >
          <span className="text-5xl">📸</span>
          <span className="text-sm font-medium text-primary">
            Haz una foto o selecciona una imagen
          </span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handlePhoto}
          className="hidden"
        />
      </div>
    );
  }

  if (mode === 'text') {
    return (
      <div className="flex flex-col items-center gap-4 py-6">
        <div className="w-full max-w-2xl">
          <p className="text-sm text-text-muted mb-3">
            Pega el texto de la receta (de ChatGPT, una web, etc.) y la IA extraera automaticamente el nombre, ingredientes, categoria y tipo. Las instrucciones se guardan tal cual.
          </p>
          <textarea
            value={pastedText}
            onChange={(e) => setPastedText(e.target.value)}
            rows={12}
            className="w-full rounded-xl border border-border bg-bg-card px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            placeholder="Pega aqui el texto completo de la receta..."
          />
          <button
            onClick={processText}
            disabled={!pastedText.trim()}
            className="mt-3 w-full rounded-xl bg-primary text-white py-3 text-sm font-semibold hover:bg-primary-dark active:scale-95 disabled:opacity-50"
          >
            ✨ Extraer receta con IA
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 py-10">
      <button
        onClick={isRecording ? stopRecording : startRecording}
        className={`flex flex-col items-center gap-3 rounded-2xl px-12 py-10 active:scale-95 ${
          isRecording
            ? 'bg-danger/10 border-2 border-danger animate-pulse'
            : 'border-2 border-dashed border-primary/40 bg-primary/5 hover:bg-primary/10'
        }`}
      >
        <span className="text-5xl">{isRecording ? '⏹️' : '🎤'}</span>
        <span className={`text-sm font-medium ${isRecording ? 'text-danger' : 'text-primary'}`}>
          {isRecording ? 'Grabando... toca para parar' : 'Toca para empezar a dictar'}
        </span>
      </button>

      {transcript && (
        <div className="w-full max-w-lg">
          <textarea
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            rows={6}
            className="w-full rounded-xl border border-border bg-bg-card px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            placeholder="El texto dictado aparecerá aquí..."
          />
          <button
            onClick={processVoice}
            className="mt-3 w-full rounded-xl bg-primary text-white py-3 text-sm font-semibold hover:bg-primary-dark active:scale-95"
          >
            ✨ Generar receta con IA
          </button>
        </div>
      )}
    </div>
  );
}

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    SpeechRecognition: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    webkitSpeechRecognition: any;
  }
}
