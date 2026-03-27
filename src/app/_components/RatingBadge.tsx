import type { NivelGusto } from '../_lib/types';

const badgeClass: Record<string, string> = {
  Sobresaliente: 'badge-sobresaliente',
  Notable: 'badge-notable',
  Bien: 'badge-bien',
  Suspenso: 'badge-suspenso',
  'Sin probar': 'badge-sinprobar',
};

export default function RatingBadge({ rating }: { rating: NivelGusto }) {
  if (!rating) return <span className="text-xs text-text-muted">—</span>;

  return (
    <span
      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${badgeClass[rating] || 'badge-sinprobar'}`}
    >
      {rating}
    </span>
  );
}
