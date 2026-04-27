// screens.jsx — UI screens (used by both desktop and mobile)
const { useState, useMemo } = React;

// ── Reusable atoms ──────────────────────────────────────────────────────────
const Brand = ({ size = 30 }) => (
  <div className="brand">
    <div className="brand-mark" style={{ width: size, height: size }}>
      <Icons.Diamond size={size * 0.55} stroke="#fff" sw={2} />
    </div>
    <span>Top<span style={{ color: "var(--brand)" }}>·</span>up</span>
  </div>
);

const GameArt = ({ game, size = "default" }) => {
  const [a, b] = game.grad;
  return (
    <div className="art" style={{
      background: `radial-gradient(120% 100% at 30% 20%, ${a}, ${b} 60%, color-mix(in oklab, ${b} 60%, #000))`
    }}>
      <div className="emblem" style={size === "small" ? { fontSize: 26 } : null}>{game.emblem}</div>
      {game.hot && <span className="ribbon hot"><Icons.Fire size={11} sw={2.2}/>Hot</span>}
      {game.new && !game.hot && <span className="ribbon new">New</span>}
    </div>
  );
};

const FakeQR = ({ size = 196 }) => {
  // deterministic dotted QR pattern
  const cells = 25;
  const cell = size / cells;
  const seed = "topup-khqr-2026";
  const dots = useMemo(() => {
    const pattern = [];
    for (let y = 0; y < cells; y++) {
      for (let x = 0; x < cells; x++) {
        const v = (Math.sin((x + 1) * 12.9898 + (y + 1) * 78.233 + seed.length) * 43758.5453) % 1;
        const fill = Math.abs(v) > 0.5;
        // skip finder corners
        const corner = (x < 7 && y < 7) || (x > cells - 8 && y < 7) || (x < 7 && y > cells - 8);
        if (!corner && fill) pattern.push(`M${x*cell} ${y*cell}h${cell}v${cell}h-${cell}z`);
      }
    }
    return pattern.join(" ");
  }, [size]);
  const finder = (x, y) => (
    <g transform={`translate(${x*cell} ${y*cell})`}>
      <rect width={cell*7} height={cell*7} fill="#000"/>
      <rect x={cell} y={cell} width={cell*5} height={cell*5} fill="#fff"/>
      <rect x={cell*2} y={cell*2} width={cell*3} height={cell*3} fill="#000"/>
    </g>
  );
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <rect width={size} height={size} fill="#fff"/>
      <path d={dots} fill="#000"/>
      {finder(0,0)}
      {finder(cells-7, 0)}
      {finder(0, cells-7)}
      <rect x={size/2-12} y={size/2-12} width="24" height="24" rx="4" fill="#fff"/>
      <rect x={size/2-9} y={size/2-9} width="18" height="18" rx="3" fill="#e11d48"/>
      <text x={size/2} y={size/2+4} textAnchor="middle" fontSize="10" fontWeight="700" fill="#fff" fontFamily="Sora,sans-serif">KH</text>
    </svg>
  );
};

// ── Top nav (desktop) ───────────────────────────────────────────────────────
function TopNav({ onSearch, query, route, go, cartCount }) {
  return (
    <div className="topnav">
      <Brand/>
      <nav className="nav-links">
        <a className={route === "home" ? "active" : ""} onClick={() => go({ name: "home" })}>Browse</a>
        <a>Promotions</a>
        <a>Help</a>
        <a>Contact</a>
      </nav>
      <div className="nav-search">
        <span className="si"><Icons.Search size={16}/></span>
        <input placeholder="Search games, subscriptions, gift cards…" value={query} onChange={e => onSearch(e.target.value)} />
      </div>
      <div className="nav-icons">
        <button className="lang-pill"><Icons.Globe size={13}/> EN</button>
        <button className="icon-btn"><Icons.Bell size={17}/><span className="badge">2</span></button>
        <button className="icon-btn"><Icons.Cart size={17}/>{cartCount > 0 && <span className="badge">{cartCount}</span>}</button>
        <button className="user-chip"><span className="avatar">L</span>Lina</button>
      </div>
    </div>
  );
}

// ── Home screen ─────────────────────────────────────────────────────────────
function HomeScreen({ go, query, setQuery }) {
  const [cat, setCat] = useState("all");
  const games = AppData.GAMES.filter(g =>
    (cat === "all" || g.cat === cat) &&
    (!query || `${g.title} ${g.sub}`.toLowerCase().includes(query.toLowerCase()))
  );

  return (
    <>
      <section className="hero">
        <div className="hero-card">
          <div>
            <span className="hero-eyebrow"><Icons.Sparkle size={12} sw={2.2}/> Limited · Diamond Friday</span>
            <h2>Top up your favorite games in seconds.</h2>
            <p>Direct delivery to your account, or instant code redemption. KHQR, bank transfer, and cards accepted.</p>
            <div className="hero-stats">
              <div className="hero-stat"><b>180+</b><span>Games & services</span></div>
              <div className="hero-stat"><b>~9s</b><span>Avg delivery</span></div>
              <div className="hero-stat"><b>4.9★</b><span>50k+ reviews</span></div>
            </div>
          </div>
          <div className="hero-art" aria-hidden="true">
            <div className="gem big"><Icons.Diamond size={64} stroke="#fff" sw={1.4}/></div>
            <div className="gem mid"><Icons.Diamond size={48} stroke="#fff" sw={1.4}/></div>
            <div className="gem sm"><Icons.Diamond size={28} stroke="#fff" sw={1.6}/></div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="cat-row">
          {AppData.CATEGORIES.map(c => {
            const Ico = Icons[c.icon];
            return (
              <button key={c.id} className="chip" aria-pressed={cat === c.id} onClick={() => setCat(c.id)}>
                <Ico size={14} sw={2}/>{c.label}
              </button>
            );
          })}
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <h3>{cat === "all" ? "Trending now" : AppData.CATEGORIES.find(c=>c.id===cat).label}</h3>
          <a>View all <Icons.Chevron size={12} sw={2.4}/></a>
        </div>
        <div className="game-grid">
          {games.map(g => (
            <button key={g.id} className="game" onClick={() => go({ name: "detail", game: g })}>
              <GameArt game={g}/>
              <div className="meta">
                <b>{g.title}</b>
                <span>{g.sub}</span>
              </div>
            </button>
          ))}
        </div>
      </section>
    </>
  );
}

// ── Detail / top-up flow screen ─────────────────────────────────────────────
function DetailScreen({ game, go, setOrder }) {
  const [pkg, setPkg] = useState(null);
  const [topupMethod, setTopupMethod] = useState(game.method === "code" ? "code" : "direct");
  const [userId, setUserId] = useState("");
  const [zoneId, setZoneId] = useState("");

  const packages = AppData.PACKAGES[game.id] || AppData.DEFAULT_PACKAGES;
  const idValid = topupMethod === "code" || (userId.length >= 6 && zoneId.length >= 3);
  const ready = pkg && idValid;

  const subtotal = pkg ? pkg.priceUSD : 0;
  const fee = subtotal > 0 ? +(subtotal * 0.02).toFixed(2) : 0;
  const total = +(subtotal + fee).toFixed(2);

  return (
    <>
      <div className="detail">
        <div className="detail-main">
          <div className="banner" style={{
            background: `radial-gradient(140% 110% at 20% 20%, ${game.grad[0]}, ${game.grad[1]} 55%, color-mix(in oklab, ${game.grad[1]} 50%, #000))`
          }}>
            <div className="logo">{game.emblem}</div>
            <div>
              <h1>{game.title}</h1>
              <p>{game.sub} · Top up {game.currency}</p>
              <div className="banner-tags">
                <span><Icons.Bolt size={11} sw={2.2} style={{verticalAlign:"-2px"}}/> Instant</span>
                <span><Icons.Shield size={11} sw={2.2} style={{verticalAlign:"-2px"}}/> Official</span>
                <span>4.9 ★ · 12,420 orders</span>
              </div>
            </div>
          </div>

          <div className="steps">
            <div className={`step ${pkg ? "done" : "active"}`}>
              <div className="num">{pkg ? <Icons.Check size={14} sw={2.6}/> : "1"}</div>
              <div><div className="lbl">Step 1</div><div className="ttl">Choose package</div></div>
            </div>
            <div className={`step ${pkg && idValid ? "done" : pkg ? "active" : ""}`}>
              <div className="num">{pkg && idValid ? <Icons.Check size={14} sw={2.6}/> : "2"}</div>
              <div><div className="lbl">Step 2</div><div className="ttl">Delivery method</div></div>
            </div>
            <div className={`step ${ready ? "active" : ""}`}>
              <div className="num">3</div>
              <div><div className="lbl">Step 3</div><div className="ttl">Payment</div></div>
            </div>
          </div>

          <h3 style={{ fontFamily:"Sora", fontSize:16, margin:"22px 0 12px" }}>How should we deliver?</h3>
          <div className="method-toggle">
            <button className="method" aria-pressed={topupMethod === "direct"} onClick={() => setTopupMethod("direct")}>
              <span className="ck">{topupMethod === "direct" && <Icons.Check size={14} sw={2.6}/>}</span>
              <div className="tag">Recommended</div>
              <h4>Direct top-up</h4>
              <p>Enter your Game ID + Zone. Diamonds appear in-game in seconds.</p>
            </button>
            <button className="method" aria-pressed={topupMethod === "code"} onClick={() => setTopupMethod("code")}>
              <span className="ck">{topupMethod === "code" && <Icons.Check size={14} sw={2.6}/>}</span>
              <div className="tag">Voucher code</div>
              <h4>Get a code</h4>
              <p>We'll send a redeem code. Paste it inside the game's top-up center.</p>
            </button>
          </div>

          {topupMethod === "direct" && (
            <div style={{ marginTop: 16 }}>
              <div className="id-fields">
                <div className="field">
                  <label>Game User ID</label>
                  <div className="input-group">
                    <input className={`input ${userId && userId.length < 6 ? "invalid" : ""}`}
                      placeholder="e.g. 312789045" value={userId} onChange={e=>setUserId(e.target.value.replace(/\D/g,""))} />
                    {userId.length >= 6 && <span className="check"><Icons.Check size={16} sw={2.6}/></span>}
                  </div>
                  <span className="hint">Find this in-game under Profile → User ID</span>
                </div>
                <div className="field">
                  <label>Zone ID</label>
                  <div className="input-group">
                    <input className="input" placeholder="2155" value={zoneId} onChange={e=>setZoneId(e.target.value.replace(/\D/g,""))}/>
                    {zoneId.length >= 3 && <span className="check"><Icons.Check size={16} sw={2.6}/></span>}
                  </div>
                  <span className="hint">Server / region code</span>
                </div>
              </div>
              {userId.length >= 6 && zoneId.length >= 3 && (
                <div className="alert" style={{ marginTop: 12 }}>
                  <Icons.Check size={16} stroke="var(--success)" sw={2.4}/>
                  <div><b>Verified:</b> Account &ldquo;LinaG_★&rdquo; — {game.title}, Zone {zoneId}.</div>
                </div>
              )}
            </div>
          )}
          {topupMethod === "code" && (
            <div className="alert" style={{ marginTop: 12 }}>
              <Icons.Info size={16} stroke="var(--brand)" sw={2.2}/>
              <div>You'll receive a one-time redeem code after payment. Use the in-game top-up center → "Redeem code".</div>
            </div>
          )}

          <h3 style={{ fontFamily:"Sora", fontSize:16, margin:"24px 0 14px" }}>Choose a package</h3>
          <div className="pkg-grid">
            {packages.map(p => (
              <button key={p.id} className="pkg" aria-pressed={pkg?.id === p.id} onClick={() => setPkg(p)}>
                {p.popular && <span className="tag popular">Popular</span>}
                {p.best && <span className="tag best">Best value</span>}
                <div className="row1"><Icons.Diamond size={14} sw={2.2}/><span style={{ fontSize:11, fontWeight:600 }}>{game.currency}</span></div>
                <div className="amount">{p.amount.toLocaleString()}</div>
                {p.bonus > 0 ? <div className="bonus">+{p.bonus} bonus</div> : <div className="bonus" style={{visibility:"hidden"}}>·</div>}
                <div className="price">${p.priceUSD.toFixed(2)}<small>USD</small></div>
              </button>
            ))}
          </div>
        </div>

        <aside className="summary">
          <h4>Order summary</h4>
          <div className="sum-row"><span>Game</span><b>{game.title}</b></div>
          <div className="sum-row"><span>Method</span><b>{topupMethod === "direct" ? "Direct top-up" : "Voucher code"}</b></div>
          {topupMethod === "direct" && userId && (
            <div className="sum-row"><span>User · Zone</span><b className="mono">{userId || "—"} · {zoneId || "—"}</b></div>
          )}
          <div className="sum-row"><span>Package</span><b>{pkg ? `${pkg.amount.toLocaleString()}${pkg.bonus ? ` +${pkg.bonus}` : ""} ${game.currency}` : "—"}</b></div>
          <div className="sum-row"><span>Service fee</span><b>${fee.toFixed(2)}</b></div>
          <div className="sum-total">
            <div className="label">Total to pay</div>
            <div className="val">${total.toFixed(2)}<small>USD</small></div>
          </div>
          <button className="cta" disabled={!ready} onClick={() => {
            setOrder({ game, pkg, topupMethod, userId, zoneId, total, fee });
            go({ name: "payment" });
          }}>
            Continue to payment <Icons.Arrow size={16} sw={2.2}/>
          </button>
          <div className="assurance">
            <Icons.Shield size={14} stroke="var(--success)" sw={2}/>
            <span>Buyer protection · 100% delivery guarantee · 24/7 support</span>
          </div>
        </aside>
      </div>
    </>
  );
}

window.HomeScreen = HomeScreen;
window.DetailScreen = DetailScreen;
window.TopNav = TopNav;
window.Brand = Brand;
window.GameArt = GameArt;
window.FakeQR = FakeQR;
