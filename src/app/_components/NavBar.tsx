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

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-border shadow-lg">
      <div className="max-w-6xl mx-auto flex justify-around">
        {navItems.map((item) => {
          const isActive = item.href === '/'
            ? pathname === '/'
            : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center py-2 px-4 text-xs ${
                isActive
                  ? 'text-primary font-semibold'
                  : 'text-text-muted hover:text-primary'
              }`}
            >
              <span className="text-xl mb-0.5">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
