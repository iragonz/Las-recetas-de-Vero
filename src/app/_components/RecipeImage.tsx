'use client';

import { useState } from 'react';

const GRADIENTS = [
  'from-orange-400 to-red-500',
  'from-green-400 to-emerald-600',
  'from-blue-400 to-indigo-500',
  'from-purple-400 to-pink-500',
  'from-yellow-400 to-orange-500',
  'from-teal-400 to-cyan-600',
  'from-rose-400 to-red-600',
  'from-amber-400 to-yellow-600',
];

function getGradient(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return GRADIENTS[Math.abs(hash) % GRADIENTS.length];
}

interface RecipeImageProps {
  src?: string;
  nombre: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function RecipeImage({ src, nombre, className = '', size = 'md' }: RecipeImageProps) {
  const [error, setError] = useState(false);

  const sizeClasses = {
    sm: 'h-12 w-12 text-lg',
    md: 'h-32 w-full text-3xl',
    lg: 'h-48 w-full text-5xl',
  };

  if (!src || error) {
    return (
      <div className={`bg-gradient-to-br ${getGradient(nombre)} ${sizeClasses[size]} flex items-center justify-center ${className}`}>
        <span className="text-white font-bold drop-shadow-md select-none">
          {nombre.charAt(0).toUpperCase()}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={nombre}
      onError={() => setError(true)}
      className={`object-cover ${sizeClasses[size]} ${className}`}
    />
  );
}
