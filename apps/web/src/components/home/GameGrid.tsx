'use client';

interface Props {
  products: any[];
  onSelect: (slug: string) => void;
}

export function GameGrid({ products, onSelect }: Props) {
  return (
    <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))' }}>
      {products.map((g: any) => (
        <button key={g.id}
          className="relative rounded-2xl overflow-hidden text-left border transition-all duration-150 hover:-translate-y-0.5"
          style={{ background: 'var(--surface)', borderColor: 'var(--line)', boxShadow: 'var(--shadow-sm)' }}
          onClick={() => onSelect(g.slug)}>
          <GameArt game={g} />
          <div className="p-3">
            <div className="flex items-center gap-1.5 mb-0.5">
              <b className="text-[13.5px] font-semibold">{g.title}</b>
              {g.vip && (
                <span className="px-1 py-0.5 rounded text-[9px] font-bold uppercase"
                  style={{ background: '#fbbf24', color: '#fff' }}>VIP</span>
              )}
            </div>
            <span className="text-[11.5px]" style={{ color: 'var(--muted)' }}>{g.sub}</span>
            {g.discountPercent > 0 && (
              <div className="mt-1 text-[11px] font-semibold" style={{ color: 'var(--success)' }}>
                🏷 {g.discountPercent}% off all packages
              </div>
            )}
          </div>
        </button>
      ))}
    </div>
  );
}

export function GameArt({ game }: { game: any }) {
  return (
    <div className="relative"
      style={{
        aspectRatio: '4/5',
        background: `radial-gradient(120% 100% at 30% 20%, ${game.gradFrom}, ${game.gradTo} 60%, color-mix(in oklab, ${game.gradTo} 60%, #000))`,
      }}>
      {/* Uploaded image — shown over the gradient when available */}
      {game.imageUrl && (
        <img src={game.imageUrl} alt={game.title}
          className="absolute inset-0 w-full h-full object-cover"
          onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
      )}
      <div className="absolute inset-0 grid place-items-center font-sora font-extrabold"
        style={{ fontSize: 42, color: 'rgba(255,255,255,.92)', textShadow: '0 6px 24px rgba(0,0,0,.4)' }}>
        {!game.imageUrl && game.emblem}
      </div>
      <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, transparent 50%, rgba(0,0,0,.55))' }} />

      {/* Badges — top-left */}
      <div className="absolute top-2.5 left-2.5 flex flex-col gap-1">
        {game.hot && (
          <span className="px-2 py-1 rounded-md text-[10px] font-bold uppercase"
            style={{ background: 'var(--accent)', color: '#fff' }}>🔥 Hot</span>
        )}
        {game.isNew && !game.hot && (
          <span className="px-2 py-1 rounded-md text-[10px] font-bold uppercase"
            style={{ background: 'var(--brand)', color: '#fff' }}>New</span>
        )}
        {game.discountPercent > 0 && (
          <span className="px-2 py-1 rounded-md text-[10px] font-bold"
            style={{ background: '#16a34a', color: '#fff' }}>-{game.discountPercent}%</span>
        )}
      </div>

      {/* VIP — top-right */}
      {game.vip && (
        <span className="absolute top-2.5 right-2.5 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase"
          style={{ background: '#fbbf24', color: '#fff' }}>VIP</span>
      )}
    </div>
  );
}
