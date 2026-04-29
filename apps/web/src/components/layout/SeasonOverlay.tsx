'use client';
import { useMemo } from 'react';

type Season = 'none' | 'summer' | 'rain' | 'snow' | 'knyear' | 'xmas';

// Particle counts per season — kept modest so animations stay smooth on mobile.
const COUNTS: Record<Season, number> = {
  none:   0,
  summer: 18,
  rain:   60,
  snow:   45,
  knyear: 22,
  xmas:   45,
};

// Deterministic pseudo-random based on index → keeps SSR/CSR markup identical.
function rand(seed: number, salt: number) {
  const x = Math.sin(seed * 9301 + salt * 49297) * 233280;
  return x - Math.floor(x);
}

export function SeasonOverlay({ season }: { season?: Season }) {
  const s: Season = season ?? 'none';

  const particles = useMemo(() => {
    const n = COUNTS[s];
    return Array.from({ length: n }, (_, i) => ({
      left:     rand(i, 1) * 100,
      delay:    rand(i, 2) * 12,        // 0–12s
      duration: 6 + rand(i, 3) * 10,    // 6–16s
      size:     0.6 + rand(i, 4) * 1.4, // 0.6–2.0× base
      drift:    -30 + rand(i, 5) * 60,  // -30..30 px horizontal drift
    }));
  }, [s]);

  if (s === 'none') return null;

  return (
    <div className="season-overlay" data-season={s} aria-hidden="true">
      {/* Tint / sun glow / aurora layer — purely decorative, no DOM cost beyond one div. */}
      <div className="season-glow" />

      {/* Particles */}
      {particles.map((p, i) => (
        <span
          key={i}
          className="season-particle"
          style={{
            left:              `${p.left}%`,
            animationDelay:    `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            // Per-particle CSS vars consumed by season-specific keyframes.
            ['--size'  as any]: p.size,
            ['--drift' as any]: `${p.drift}px`,
          }}
        />
      ))}
    </div>
  );
}
