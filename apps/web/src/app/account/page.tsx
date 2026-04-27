'use client';
import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useStore } from '@/lib/store';
import { TopNav } from '@/components/layout/TopNav';

export default function AccountPage() {
  const router    = useRouter();
  const user      = useStore(s => s.user);
  const brandColor = useStore(s => s.brandColor);
  const dark       = useStore(s => s.dark);
  const setBrand   = useStore(s => s.setBrand);
  const setDark    = useStore(s => s.setDark);
  const clearAuth  = useStore(s => s.clearAuth);
  const colorRef   = useRef<HTMLInputElement>(null);

  // Apply theme changes immediately
  useEffect(() => {
    document.documentElement.style.setProperty('--brand', brandColor);
  }, [brandColor]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
  }, [dark]);

  function signOut() {
    clearAuth();
    router.push('/auth/login');
  }

  if (!user) {
    return (
      <div className="min-h-screen grid place-items-center" style={{ background: 'var(--bg)' }}>
        <div className="text-center">
          <p style={{ color: 'var(--muted)' }}>You're not signed in.</p>
          <Link href="/auth/login" className="mt-3 inline-block px-4 py-2 rounded-xl text-sm font-semibold no-underline"
            style={{ background: 'var(--brand)', color: '#fff' }}>Sign in</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <TopNav query="" onSearch={() => {}} activeRoute="account" />

      <div className="max-w-2xl mx-auto px-6 py-8 route-content">
        {/* Profile header */}
        <div className="flex items-center gap-4 p-6 rounded-[22px] mb-6"
          style={{ background: 'var(--surface)', border: '1px solid var(--line)', boxShadow: 'var(--shadow-sm)' }}>
          <div className="w-16 h-16 rounded-full grid place-items-center text-2xl font-bold text-white flex-none"
            style={{ background: 'linear-gradient(135deg, #fbbf24, #ef4444)' }}>
            {user.name?.[0]?.toUpperCase() ?? 'U'}
          </div>
          <div>
            <h2 className="font-sora font-bold text-xl m-0">{user.name}</h2>
            <p className="m-0 text-sm mt-0.5" style={{ color: 'var(--muted)' }}>{user.email}</p>
            <span className="inline-block mt-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold uppercase"
              style={{ background: user.role === 'ADMIN' ? 'var(--accent)' : 'var(--brand-soft)', color: user.role === 'ADMIN' ? '#fff' : 'var(--brand)' }}>
              {user.role}
            </span>
          </div>
        </div>

        {/* Quick links */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {[
            { href: '/account/orders',   icon: '🧾', label: 'Order history',  sub: 'View past top-ups' },
            { href: '/account/saved-ids',icon: '🎮', label: 'Saved Game IDs', sub: 'Quick fill on checkout' },
          ].map(item => (
            <Link key={item.href} href={item.href}
              className="flex items-center gap-3 p-4 rounded-xl border no-underline transition-all hover:-translate-y-0.5"
              style={{ background: 'var(--surface)', borderColor: 'var(--line)', color: 'var(--ink)' }}>
              <span className="text-2xl">{item.icon}</span>
              <div>
                <b className="block text-[14px] font-semibold">{item.label}</b>
                <span className="text-[12px]" style={{ color: 'var(--muted)' }}>{item.sub}</span>
              </div>
            </Link>
          ))}
        </div>

        {/* Appearance */}
        <div className="p-6 rounded-[22px] mb-6"
          style={{ background: 'var(--surface)', border: '1px solid var(--line)', boxShadow: 'var(--shadow-sm)' }}>
          <h3 className="font-sora font-bold text-[16px] m-0 mb-4">Appearance</h3>

          {/* Brand color */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <b className="text-[14px] font-semibold block">Brand color</b>
              <span className="text-[12px]" style={{ color: 'var(--muted)' }}>Applies to buttons & accents</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                ref={colorRef}
                type="color"
                value={brandColor}
                onChange={e => setBrand(e.target.value)}
                className="w-10 h-10 rounded-lg border cursor-pointer"
                style={{ borderColor: 'var(--line)', padding: 2 }}
              />
              <span className="font-mono text-[12px]" style={{ color: 'var(--muted)' }}>{brandColor}</span>
            </div>
          </div>

          {/* Dark mode */}
          <div className="flex items-center justify-between">
            <div>
              <b className="text-[14px] font-semibold block">Dark mode</b>
              <span className="text-[12px]" style={{ color: 'var(--muted)' }}>Switch between light and dark</span>
            </div>
            <button
              role="switch"
              aria-checked={dark}
              onClick={() => setDark(!dark)}
              className="relative w-12 h-6 rounded-full transition-all duration-200"
              style={{ background: dark ? '#34c759' : 'rgba(0,0,0,.15)' }}
            >
              <span
                className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform duration-200"
                style={{ left: 2, transform: dark ? 'translateX(24px)' : 'none', boxShadow: '0 1px 3px rgba(0,0,0,.25)' }}
              />
            </button>
          </div>

          {/* Quick presets */}
          <div className="mt-5 pt-4" style={{ borderTop: '1px dashed var(--line)' }}>
            <span className="text-[11px] uppercase tracking-widest font-semibold" style={{ color: 'var(--muted)' }}>Quick presets</span>
            <div className="flex gap-2 mt-2.5 flex-wrap">
              {[
                { label: '🎮 Gamer',    color: '#8b5cf6', dark: true  },
                { label: '💰 Trust',    color: '#16a34a', dark: false },
                { label: '🔥 Energy',   color: '#f97316', dark: false },
                { label: '🌌 Midnight', color: '#3b82f6', dark: true  },
                { label: '❤️ Rose',     color: '#e11d48', dark: false },
              ].map(p => (
                <button
                  key={p.label}
                  onClick={() => { setBrand(p.color); setDark(p.dark); }}
                  className="px-3 py-1.5 rounded-lg text-[12px] font-medium border transition-all"
                  style={{ background: 'var(--surface-2)', borderColor: 'var(--line)', color: 'var(--ink)' }}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Sign out */}
        <button
          onClick={signOut}
          className="w-full h-11 rounded-xl font-semibold text-[14px] border transition-all"
          style={{ background: 'var(--surface)', borderColor: 'var(--line)', color: 'var(--danger)' }}
        >
          Sign out
        </button>
      </div>
    </div>
  );
}
