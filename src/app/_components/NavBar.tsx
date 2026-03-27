'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/', label: 'Recetas', icon: '🍳' },
  { href: '/planificador', label: 'Semana', icon: '📅' },
  { href: '/lista-compra', label: 'Compra', icon: '🛒' },
  { href: '/valoraciones', label: 'Top', icon: '⭐' },
];

export default function NavBar() {
  const pathname = usePathname();

  if (pathname === '/login') return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-border/50 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
      <div className="max-w-5xl mx-auto flex justify-around">
        {navItems.map((item) => {
          const isActive = item.href === '/'
            ? pathname === '/'
            : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center py-2.5 px-5 text-[11px] font-medium relative ${
                isActive
                  ? 'text-primary'
                  : 'text-text-muted hover:text-primary'
              }`}
            >
              {isActive && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full" />
              )}
              <span className="text-xl mb-0.5">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
