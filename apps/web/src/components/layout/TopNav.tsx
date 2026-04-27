'use client';
import Link from 'next/link';
import { useStore } from '@/lib/store';

interface Props {
  query: string;
  onSearch: (q: string) => void;
  activeRoute: string;
}

export function TopNav({ query, onSearch, activeRoute }: Props) {
  const user = useStore(s => s.user);

  return (
    <nav
      className="sticky top-0 z-20 flex items-center gap-6 px-8 py-3.5"
      style={{ background: 'var(--surface)', borderBottom: '1px solid var(--line)' }}
    >
      {/* Brand */}
      <Link href="/" className="flex items-center gap-2.5 font-sora font-bold text-[17px] no-underline" style={{ color: 'var(--ink)' }}>
        <div
          className="w-8 h-8 rounded-[9px] grid place-items-center text-white"
          style={{ background: 'linear-gradient(135deg, var(--brand), color-mix(in oklab, var(--brand) 50%, #000))' }}
        >
          💎
        </div>
        Top<span style={{ color: 'var(--brand)' }}>·</span>up
      </Link>

      {/* Nav links */}
      <div className="flex gap-1 ml-2">
        {[['/', 'Browse'], ['/promotions', 'Promotions'], ['/help', 'Help']].map(([href, label]) => (
          <Link
            key={href}
            href={href}
            className="px-3 py-2 rounded-lg text-[13px] font-medium no-underline transition-colors"
            style={{
              color: activeRoute === 'home' && href === '/' ? 'var(--ink)' : 'var(--muted)',
              background: activeRoute === 'home' && href === '/' ? 'var(--surface-2)' : undefined,
            }}
          >
            {label}
          </Link>
        ))}
      </div>

      {/* Search */}
      <div className="flex-1 max-w-lg mx-3 relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)] pointer-events-none">🔍</span>
        <input
          className="w-full h-10 pl-10 pr-4 rounded-xl border text-[13.5px] outline-none transition-all"
          style={{ background: 'var(--surface-2)', borderColor: 'var(--line)', color: 'var(--ink)' }}
          placeholder="Search games, subscriptions, gift cards…"
          value={query}
          onChange={e => onSearch(e.target.value)}
        />
      </div>

      {/* Icons */}
      <div className="flex items-center gap-1.5 ml-auto">
        <button
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border text-[12px] font-medium"
          style={{ borderColor: 'var(--line)', background: 'var(--surface)', color: 'var(--ink-2)' }}
        >
          🌐 EN
        </button>

        <button
          className="relative w-[38px] h-[38px] rounded-xl border grid place-items-center"
          style={{ background: 'var(--surface)', borderColor: 'var(--line)', color: 'var(--ink-2)' }}
        >
          🔔
          <span
            className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full text-[10px] font-semibold flex items-center justify-center text-white"
            style={{ background: 'var(--brand)', border: '2px solid var(--surface)' }}
          >
            2
          </span>
        </button>

        {user ? (
          <div className="flex items-center gap-1.5">
            {user.role === 'ADMIN' && (
              <Link href="/admin"
                className="px-2.5 py-1.5 rounded-lg text-[11.5px] font-semibold no-underline"
                style={{ background: 'var(--accent)', color: '#fff' }}>
                ⚙️ Admin
              </Link>
            )}
            <Link
              href="/account"
              className="flex items-center gap-2 px-2.5 py-1 rounded-full border text-[12.5px] font-medium no-underline"
              style={{ borderColor: 'var(--line)', background: 'var(--surface)', color: 'var(--ink)' }}
            >
              <span
                className="w-[30px] h-[30px] rounded-full grid place-items-center text-white text-xs font-bold"
                style={{ background: 'linear-gradient(135deg, #fbbf24, #ef4444)' }}
              >
                {user.name?.[0]?.toUpperCase() ?? 'U'}
              </span>
              {user.name?.split(' ')[0]}
            </Link>
          </div>
        ) : (
          <Link
            href="/auth/login"
            className="px-4 py-2 rounded-xl text-[13px] font-semibold no-underline"
            style={{ background: 'var(--brand)', color: '#fff' }}
          >
            Sign in
          </Link>
        )}
      </div>
    </nav>
  );
}
