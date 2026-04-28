'use client';
import { useT } from '@/lib/i18n';

export function HeroCard() {
  const t = useT();
  return (
    <section className="px-8 py-5">
      <div
        className="relative overflow-hidden rounded-[22px] p-8 grid gap-6 min-h-[200px]"
        style={{
          gridTemplateColumns: '1.2fr 1fr',
          background:
            'radial-gradient(800px 320px at 0% 0%, color-mix(in oklab, var(--brand) 30%, transparent), transparent 60%), radial-gradient(700px 360px at 100% 100%, color-mix(in oklab, var(--accent) 24%, transparent), transparent 60%), linear-gradient(135deg, #0b1226, #1a2244 60%, #0b1226)',
          color: '#fff',
        }}
      >
        <div>
          <span
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11.5px] tracking-widest uppercase"
            style={{ background: 'rgba(255,255,255,.1)', border: '1px solid rgba(255,255,255,.18)', color: '#dbe1ff' }}
          >
            {t('heroBadge', '✦ Limited · Diamond Friday')}
          </span>
          <h2
            className="mt-3 mb-2 font-sora font-bold leading-tight"
            style={{ fontSize: 34, letterSpacing: '-.02em' }}
          >
            {t('heroTitle', 'Top up your favorite games in seconds.')}
          </h2>
          <p style={{ color: '#c9d1ee', fontSize: 14, lineHeight: 1.6 }}>
            {t('heroSubtitle', 'Direct delivery or instant code redemption. KHQR, bank transfer, and cards accepted.')}
          </p>
          <div className="flex gap-3 mt-4">
            {[['180+', t('heroStatGames')], ['~9s', t('heroStatDelivery')], ['4.9★', t('heroStatRating')]].map(([v, l]) => (
              <div
                key={l}
                className="rounded-xl px-3 py-2 min-w-[100px]"
                style={{ background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.12)' }}
              >
                <b className="block font-sora text-lg">{v}</b>
                <span style={{ color: '#a8b1d4', fontSize: 11 }}>{l}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="relative h-[220px]" aria-hidden="true">
          {[
            { cls: 'big',   style: { right: '4%',  top: '8%',  width: 140, height: 140, transform: 'rotate(8deg)'  } },
            { cls: 'mid',   style: { right: '38%', top: '32%', width: 92,  height: 92,  transform: 'rotate(-12deg)' } },
            { cls: 'sm',    style: { right: '60%', top: '8%',  width: 64,  height: 64,  transform: 'rotate(20deg)' } },
          ].map(({ cls, style }) => (
            <div
              key={cls}
              className="absolute rounded-2xl grid place-items-center"
              style={{
                ...style,
                background: 'linear-gradient(135deg, rgba(255,255,255,.18), rgba(255,255,255,.04))',
                border: '1px solid rgba(255,255,255,.18)',
                backdropFilter: 'blur(12px)',
                boxShadow: '0 30px 50px rgba(0,0,0,.35)',
              }}
            >
              <span style={{ fontSize: cls === 'sm' ? 28 : cls === 'mid' ? 48 : 64, opacity: .9 }}>💎</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
