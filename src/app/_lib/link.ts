/**
 * Normaliza lo que el usuario escribe en el campo "Link".
 * El campo es libre: puede quedarse vacío o llevar texto suelto.
 *
 *   ''                     -> ''            (no se guarda nada)
 *   'https://youtu.be/x'   -> tal cual
 *   'youtube.com/watch?v=x'-> 'https://youtube.com/watch?v=x'
 *   'la receta de mi madre'-> tal cual
 */
export function normalizeLink(raw: string): string {
  const value = raw.trim();
  if (!value) return '';
  // Ya trae esquema (https://, http://, ...)
  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(value)) return value;
  // Parece un dominio suelto: sin espacios y con un punto y extensión
  if (!/\s/.test(value) && /^[^\s/]+\.[^\s/.]{2,}/.test(value)) return `https://${value}`;
  // Texto libre: se guarda como lo escribió el usuario
  return value;
}
