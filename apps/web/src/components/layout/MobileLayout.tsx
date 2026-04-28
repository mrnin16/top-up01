'use client';
import Link from 'next/link';
import { LanguageToggle } from './LanguageToggle';
import { useT } from '@/lib/i18n';

interface Props {
  query: string;
  setQuery: (q: string) => void;
  categories: any[];
  products: any[];
  cat: string;
  setCat: (c: string) => void;
  onSelect: (slug: string) => void;
}

export function MobileLayout({ query, setQuery, categories, products, cat, setCat, onSelect }: Props) {
  const t = useT();
  const all = [{ slug: 'all', label: t('categoryAll'), icon: 'all' }, ...categories];

  return (
    <div className="flex flex-col h-screen relative" style={{ background: 'var(--bg)' }}>
      {/* Top */}
      <div className="flex items-center justify-between px-4 pt-2 pb-3">
        <div>
          <span className="block text-[11.5px]" style={{ color: 'var(--muted)' }}>{t('greeting', 'Hi, there 👋')}</span>
          <b className="font-sora text-[18px]">{t('greetingPrompt', 'What are you topping up?')}</b>
        </div>
        <div className="flex items-center gap-2">
          <LanguageToggle variant="pill" />
          <button
            className="relative w-10 h-10 rounded-xl border grid place-items-center"
            style={{ background: 'var(--surface)', borderColor: 'var(--line)' }}
            aria-label="Notifications"
          >
            🔔
            <span
              className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[10px] font-bold grid place-items-center text-white"
              style={{ background: 'var(--brand)', border: '2px solid var(--surface)' }}
            >
              2
            </span>
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="px-4 relative">
        <span className="absolute left-7 top-1/2 -translate-y-1/2 text-[var(--muted)] pointer-events-none text-sm">🔍</span>
        <input
          className="w-full h-11 pl-10 pr-4 rounded-xl border outline-none text-[14px]"
          style={{ background: 'var(--surface)', borderColor: 'var(--line)' }}
          placeholder={t('searchPlaceholder')}
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto pb-24" style={{ scrollbarWidth: 'none' }}>
        {/* Hero — mirrors desktop HeroCard for consistent branding */}
        <div
          className="mx-4 mt-3.5 rounded-[22px] p-5 relative overflow-hidden"
          style={{
            background:
              'radial-gradient(600px 240px at 0% 0%, color-mix(in oklab, var(--brand) 30%, transparent), transparent 60%), radial-gradient(500px 260px at 100% 100%, color-mix(in oklab, var(--accent) 24%, transparent), transparent 60%), linear-gradient(135deg, #0b1226, #1a2244 60%, #0b1226)',
            color: '#fff',
          }}
        >
          <span
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10.5px] tracking-widest uppercase"
            style={{ background: 'rgba(255,255,255,.1)', border: '1px solid rgba(255,255,255,.18)', color: '#dbe1ff' }}
          >
            {t('heroBadge', '✦ Limited · Diamond Friday')}
          </span>
          <h2 className="mt-2.5 mb-1.5 font-sora font-bold leading-tight" style={{ fontSize: 22, letterSpacing: '-.02em' }}>
            {t('heroTitle', 'Top up your favorite games in seconds.')}
          </h2>
          <p className="text-[12px] m-0 mb-3" style={{ color: '#c9d1ee', lineHeight: 1.55 }}>
            {t('heroSubtitle', 'Direct delivery or instant code redemption. KHQR, bank transfer, and cards accepted.')}
          </p>
          <div className="flex gap-2">
            {[['180+', t('heroStatGames')], ['~9s', t('heroStatDelivery')], ['4.9★', t('heroStatRating')]].map(([v, l]) => (
              <div
                key={l}
                className="rounded-xl px-2.5 py-1.5 flex-1 min-w-0"
                style={{ background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.14)' }}
              >
                <b className="block font-sora text-[13px] leading-none">{v}</b>
                <span style={{ color: '#a8b1d4', fontSize: 10 }}>{l}</span>
              </div>
            ))}
          </div>
          <span className="absolute right-2 top-3 text-[40px] opacity-50 pointer-events-none select-none" style={{ transform: 'rotate(8deg)' }}>💎</span>
        </div>

        {/* Category chips */}
        <div className="flex gap-2 mt-3.5 px-4 pb-1 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
          {all.map((c: any) => (
            <button
              key={c.slug}
              aria-pressed={cat === c.slug}
              onClick={() => setCat(c.slug)}
              className="tap-bounce flex-none inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full border text-[13px] font-medium"
              style={{
                background:  cat === c.slug ? 'var(--brand)'    : 'var(--surface)',
                color:       cat === c.slug ? 'var(--brand-ink)': 'var(--ink-2)',
                borderColor: cat === c.slug ? 'var(--brand)'    : 'var(--line)',
                transition: 'background .2s ease, color .2s ease, border-color .2s ease, transform .12s cubic-bezier(.34, 1.56, .64, 1), filter .12s ease',
              }}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Grid */}
        <h3 className="font-sora text-[15px] font-bold mx-4 mt-6 mb-3">
          {cat === 'all' ? t('trending') : all.find((c: any) => c.slug === cat)?.label}
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 px-4">
          {products.map((g: any) => (
            <button
              key={g.id}
              className="tap-bounce-sm rounded-xl overflow-hidden border text-left"
              style={{ background: 'var(--surface)', borderColor: 'var(--line)' }}
              onClick={() => onSelect(g.slug)}
            >
              {/* ── Art ── */}
              <div
                className="aspect-[4/5] relative overflow-hidden"
                style={{ background: `radial-gradient(120% 100% at 30% 20%, ${g.gradFrom}, ${g.gradTo} 60%)` }}
              >
                {/* Uploaded image — shown over the gradient when available */}
                {g.imageUrl && (
                  <img
                    src={g.imageUrl}
                    alt={g.title}
                    className="absolute inset-0 w-full h-full object-cover"
                    onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                )}

                {/* Emblem shown only when no image */}
                {!g.imageUrl && (
                  <div className="absolute inset-0 grid place-items-center font-sora font-extrabold text-3xl sm:text-2xl"
                    style={{ color: 'rgba(255,255,255,.92)', textShadow: '0 4px 16px rgba(0,0,0,.4)' }}>
                    {g.emblem}
                  </div>
                )}

                {/* Bottom gradient overlay */}
                <div className="absolute inset-0"
                  style={{ background: 'linear-gradient(180deg, transparent 50%, rgba(0,0,0,.55))' }} />

                {/* Badges */}
                <div className="absolute top-1.5 left-1.5 flex flex-col gap-1">
                  {g.hot && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase"
                      style={{ background: 'var(--accent)', color: '#fff' }}>🔥</span>
                  )}
                  {g.isNew && !g.hot && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase"
                      style={{ background: 'var(--brand)', color: '#fff' }}>New</span>
                  )}
                  {g.discountPercent > 0 && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold"
                      style={{ background: '#16a34a', color: '#fff' }}>-{g.discountPercent}%</span>
                  )}
                </div>
                {g.vip && (
                  <span className="absolute top-1.5 right-1.5 px-1 py-0.5 rounded text-[9px] font-bold uppercase"
                    style={{ background: '#fbbf24', color: '#fff' }}>VIP</span>
                )}
              </div>

              {/* ── Meta ── */}
              <div className="px-2.5 py-2.5">
                <b className="block text-[13px] sm:text-[11px] font-semibold leading-tight truncate">{g.title}</b>
                <span className="text-[11px] sm:text-[10px]" style={{ color: 'var(--muted)' }}>{g.sub}</span>
                {g.discountPercent > 0 && (
                  <div className="text-[10.5px] sm:text-[9.5px] font-semibold mt-0.5" style={{ color: 'var(--success)' }}>
                    {g.discountPercent}% off
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Bottom tab */}
      <div
        className="absolute bottom-3 left-3 right-3 h-16 rounded-[18px] flex"
        style={{ background: 'var(--surface)', border: '1px solid var(--line)', boxShadow: 'var(--shadow-md)', padding: 6 }}
      >
        {[
          { href: '/',                icon: '🏠', label: t('tabHome'),    active: true  },
          { href: '#',                icon: '✨', label: t('tabDeals'),   active: false },
          { href: '/account/orders',  icon: '🧾', label: t('tabOrders'),  active: false },
          { href: '/account',         icon: '👤', label: t('tabAccount'), active: false },
        ].map(tab => (
          <Link
            key={tab.label}
            href={tab.href}
            className="tap-bounce flex-1 flex flex-col items-center justify-center gap-0.5 rounded-xl text-[10.5px] font-medium no-underline"
            style={{
              color:      tab.active ? 'var(--brand)' : 'var(--muted)',
              background: tab.active ? 'color-mix(in oklab, var(--brand) 8%, transparent)' : 'transparent',
              transition: 'color .2s ease, background .2s ease, transform .12s cubic-bezier(.34, 1.56, .64, 1), filter .12s ease',
            }}
          >
            <span className="text-lg leading-none">{tab.icon}</span>
            {tab.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
