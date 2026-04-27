'use client';

/** Faceted diamond SVG — models the crown + pavilion + girdle of a brilliant cut gem */
export function DiamondGem({
  size  = 28,
  color = '#3b9eff',
  glow  = false,
}: {
  size?:  number;
  color?: string;
  glow?:  boolean;
}) {
  const id = `dg-${size}-${color.replace('#', '')}`;
  const h  = Math.round(size * 0.92);

  return (
    <svg
      width={size} height={h}
      viewBox="0 0 52 48"
      xmlns="http://www.w3.org/2000/svg"
      style={glow ? { filter: `drop-shadow(0 0 ${size * 0.18}px ${color}cc)` } : undefined}>
      <defs>
        {/* Crown gradient: pale → brand blue */}
        <linearGradient id={`${id}-c`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor="#edf8ff"/>
          <stop offset="60%"  stopColor={color}/>
          <stop offset="100%" stopColor={color} stopOpacity="0.7"/>
        </linearGradient>
        {/* Pavilion gradient: brand → deep navy */}
        <linearGradient id={`${id}-p`} x1="20%" y1="0%" x2="80%" y2="100%">
          <stop offset="0%"   stopColor={color}/>
          <stop offset="100%" stopColor="#06307a"/>
        </linearGradient>
      </defs>

      {/* ── Crown (top half) ─────────────────────────────────────── */}
      {/* Table (central top facet — bright) */}
      <polygon points="26,1 11,19 41,19"      fill={`url(#${id}-c)`}/>
      {/* Left star facets */}
      <polygon points="26,1 0,14 11,19"       fill="#cce8ff" opacity="0.88"/>
      <polygon points="0,14 11,19 0,23"       fill="#b0d8f8" opacity="0.8"/>
      {/* Right star facets */}
      <polygon points="26,1 52,14 41,19"      fill="#88c4f4" opacity="0.85"/>
      <polygon points="52,14 41,19 52,23"     fill="#70b4e8" opacity="0.8"/>

      {/* ── Girdle (horizontal band) ──────────────────────────────── */}
      <polygon points="0,22 11,19 41,19 52,22 41,25 11,25"
        fill="rgba(255,255,255,0.22)" stroke="rgba(255,255,255,0.45)" strokeWidth="0.4"/>

      {/* ── Pavilion (bottom half) ───────────────────────────────── */}
      {/* Centre main facets (lighter) */}
      <polygon points="11,26 26,47 41,26"     fill={`url(#${id}-p)`} opacity="0.92"/>
      {/* Side pavilion facets */}
      <polygon points="0,23 11,26 26,47"      fill="#1260c0" opacity="0.88"/>
      <polygon points="52,23 41,26 26,47"     fill="#0d50a8" opacity="0.88"/>
      {/* Bottom corners */}
      <polygon points="0,23 0,26 11,26"       fill="#0e4a9c" opacity="0.75"/>
      <polygon points="52,23 52,26 41,26"     fill="#0a4090" opacity="0.75"/>

      {/* ── Highlights ───────────────────────────────────────────── */}
      {/* Primary white streak across crown */}
      <polygon points="24,2 14,16 27,14"      fill="white" opacity="0.62"/>
      {/* Secondary gleam top-right */}
      <polygon points="30,4 38,14 43,9"       fill="white" opacity="0.28"/>
      {/* Tip sparkle */}
      <circle cx="26" cy="8" r="1.8"          fill="white" opacity="0.75"/>
      {/* Small pavilion glint */}
      <polygon points="14,28 22,42 12,36"     fill="white" opacity="0.12"/>
    </svg>
  );
}

/** Cluster of diamond gems that scales with package amount */
export function DiamondCluster({
  amount,
  currency,
  currencyImageUrl,
  size = 'md',
}: {
  amount:           number;
  currency:         string;
  currencyImageUrl?: string | null;
  size?:            'sm' | 'md' | 'lg';
}) {
  // If admin uploaded a custom currency icon, use that instead
  if (currencyImageUrl) {
    const px = size === 'sm' ? 28 : size === 'lg' ? 48 : 36;
    return (
      <div className="flex items-center justify-center" style={{ height: size === 'lg' ? 52 : 40 }}>
        <img src={currencyImageUrl} alt={currency}
          style={{ width: px, height: px, objectFit: 'contain' }}
          onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}/>
      </div>
    );
  }

  // Derive gem count + gem size from package amount
  const count = amount <= 22   ? 1
              : amount <= 56   ? 2
              : amount <= 172  ? 3
              : amount <= 343  ? 4
              : amount <= 568  ? 5
              : amount <= 1167 ? 6
              : amount <= 2398 ? 8
              : 10;

  const gemPx  = size === 'sm' ? 18 : size === 'lg' ? 28 : 22;
  const spread = size === 'sm' ? 12 : size === 'lg' ? 18 : 14;

  // Pre-computed positions for natural-feeling clusters (offsets from centre)
  const positions: [number, number, number][] = [
    // [dx, dy, rotation°]
    [0,   0,  0],
    [-spread*0.8,  -spread*0.3,  -18],
    [ spread*0.8,  -spread*0.3,   18],
    [ 0,           spread*0.75,   6],
    [-spread*0.55,  spread*0.5,  -10],
    [ spread*0.55,  spread*0.5,   10],
    [-spread*1.0,   0,           -22],
    [ spread*1.0,   0,            22],
    [-spread*0.4,  -spread*0.8,  -8],
    [ spread*0.4,  -spread*0.8,   8],
  ];

  const used = positions.slice(0, count);

  // Bounding box so the cluster is centred in its container
  const xs = used.map(p => p[0]);
  const ys = used.map(p => p[1]);
  const minX = Math.min(...xs) - gemPx / 2;
  const maxX = Math.max(...xs) + gemPx / 2;
  const minY = Math.min(...ys) - gemPx * 0.46;
  const maxY = Math.max(...ys) + gemPx * 0.92;
  const W = maxX - minX + 4;
  const H = maxY - minY + 4;

  return (
    <svg width={W} height={H} viewBox={`${minX - 2} ${minY - 2} ${W} ${H}`}
      xmlns="http://www.w3.org/2000/svg" overflow="visible">
      {used.map(([dx, dy, rot], i) => (
        <g key={i} transform={`translate(${dx},${dy}) rotate(${rot},${gemPx / 2},${gemPx * 0.46})`}>
          <DiamondSVG size={gemPx} />
        </g>
      ))}
    </svg>
  );
}

/** Inline SVG diamond without the wrapper — used inside a <g transform> */
function DiamondSVG({ size }: { size: number }) {
  const s = size / 52;   // scale factor from 52-unit viewBox
  return (
    <g transform={`scale(${s})`}>
      <polygon points="26,1 11,19 41,19"   fill="#d6f0ff" opacity="0.95"/>
      <polygon points="26,1 0,14 11,19"    fill="#cce8ff" opacity="0.88"/>
      <polygon points="0,14 11,19 0,23"    fill="#b0d8f8" opacity="0.8"/>
      <polygon points="26,1 52,14 41,19"   fill="#88c4f4" opacity="0.85"/>
      <polygon points="52,14 41,19 52,23"  fill="#70b4e8" opacity="0.8"/>
      <polygon points="0,22 11,19 41,19 52,22 41,25 11,25" fill="rgba(255,255,255,0.2)" stroke="rgba(255,255,255,0.4)" strokeWidth="0.5"/>
      <polygon points="11,26 26,47 41,26"  fill="#3a90e8" opacity="0.92"/>
      <polygon points="0,23 11,26 26,47"   fill="#1a66c8" opacity="0.88"/>
      <polygon points="52,23 41,26 26,47"  fill="#1258b8" opacity="0.88"/>
      <polygon points="24,2 14,16 27,14"   fill="white"   opacity="0.65"/>
      <polygon points="30,4 38,14 43,9"    fill="white"   opacity="0.28"/>
      <circle  cx="26" cy="8" r="1.8"      fill="white"   opacity="0.8"/>
    </g>
  );
}
