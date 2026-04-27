// mobile.jsx — mobile-first variant of the same flow
const { useState: useM, useEffect: useEffM } = React;

function MobileApp({ route, go, query, setQuery, order, setOrder, receipt, setReceipt }) {
  const routeKey = route.name + (route.game?.id || '');
  return (
    <div className="m-app">
      <div key={routeKey} className="route-content" style={{ flex:1, minHeight:0, display:'flex', flexDirection:'column' }}>
        {route.name === "home" && <MobileHome go={go} query={query} setQuery={setQuery}/>}
        {route.name === "detail" && <MobileDetail game={route.game} go={go} setOrder={setOrder}/>}
        {route.name === "payment" && <MobilePayment order={order} go={go} setReceipt={setReceipt}/>}
        {route.name === "success" && <MobileSuccess receipt={receipt} go={go}/>}
      </div>
    </div>
  );
}

function MobileHome({ go, query, setQuery }) {
  const [cat, setCat] = useM("all");
  const games = AppData.GAMES.filter(g =>
    (cat === "all" || g.cat === cat) &&
    (!query || `${g.title} ${g.sub}`.toLowerCase().includes(query.toLowerCase()))
  );
  return (
    <>
      <div className="m-top">
        <div className="greet">
          <span>Hi, Lina 👋</span>
          <b>What are you topping up?</b>
        </div>
        <button className="icon-btn"><Icons.Bell size={17}/><span className="badge">2</span></button>
      </div>
      <div className="m-search">
        <div className="m-search-inner">
          <Icons.Search size={16} className="si"/>
          <input placeholder="Mobile Legends, Free Fire, Spotify…" value={query} onChange={e=>setQuery(e.target.value)}/>
        </div>
      </div>

      <div className="m-content thin-scroll">
        <div className="m-hero">
          <h2>Diamond Friday — up to 12% bonus</h2>
          <p>On select packages today only.</p>
          <button>Explore deals →</button>
          <div className="gem"><Icons.Diamond size={120} stroke="rgba(255,255,255,.5)" sw={1}/></div>
        </div>

        <div className="m-cats" style={{ marginTop: 14 }}>
          {AppData.CATEGORIES.map(c => {
            const Ico = Icons[c.icon];
            return (
              <button key={c.id} className="chip" aria-pressed={cat === c.id} onClick={()=>setCat(c.id)}>
                <Ico size={13} sw={2}/>{c.label}
              </button>
            );
          })}
        </div>

        <div className="m-section">
          <h3>{cat === "all" ? "Trending" : AppData.CATEGORIES.find(c=>c.id===cat).label}</h3>
        </div>
        <div className="m-grid">
          {games.map(g => (
            <button key={g.id} className="game" onClick={() => go({ name: "detail", game: g })}>
              <GameArt game={g} size="small"/>
              <div className="meta">
                <b>{g.title}</b>
                <span>{g.sub}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="m-tab">
        <button className="active"><Icons.Home size={18} sw={2}/>Home</button>
        <button><Icons.Sparkle size={18} sw={2}/>Deals</button>
        <button><Icons.Receipt size={18} sw={2}/>Orders</button>
        <button><Icons.User size={18} sw={2}/>Account</button>
      </div>
    </>
  );
}

function MobileDetail({ game, go, setOrder }) {
  const [pkg, setPkg] = useM(null);
  const [tm, setTm] = useM(game.method === "code" ? "code" : "direct");
  const [uid, setUid] = useM("");
  const [zid, setZid] = useM("");
  const packages = AppData.PACKAGES[game.id] || AppData.DEFAULT_PACKAGES;
  const idValid = tm === "code" || (uid.length >= 6 && zid.length >= 3);
  const ready = pkg && idValid;
  const subtotal = pkg ? pkg.priceUSD : 0;
  const fee = subtotal > 0 ? +(subtotal * 0.02).toFixed(2) : 0;
  const total = +(subtotal + fee).toFixed(2);

  return (
    <>
      <div className="m-detail-banner" style={{
        background: `radial-gradient(140% 110% at 20% 20%, ${game.grad[0]}, ${game.grad[1]} 55%, color-mix(in oklab, ${game.grad[1]} 50%, #000))`
      }}>
        <button className="back" onClick={()=>go({ name:"home" })}><Icons.Back size={18} sw={2.2}/></button>
        <div className="logo">{game.emblem}</div>
        <h1>{game.title}</h1>
        <div style={{ display:"flex", gap:6, marginTop:8 }}>
          <span style={{ padding:"3px 8px", background:"rgba(255,255,255,.2)", borderRadius:999, fontSize:10.5 }}><Icons.Bolt size={10} sw={2.4} style={{verticalAlign:-1}}/> Instant</span>
          <span style={{ padding:"3px 8px", background:"rgba(255,255,255,.2)", borderRadius:999, fontSize:10.5 }}>4.9 ★</span>
        </div>
      </div>

      <div className="m-content thin-scroll" style={{ padding:"16px 0 100px" }}>
        <div style={{ padding:"0 18px" }}>
          <div className="method-toggle">
            <button className="method" aria-pressed={tm==="direct"} onClick={()=>setTm("direct")}>
              <span className="ck">{tm==="direct" && <Icons.Check size={12} sw={2.6}/>}</span>
              <h4 style={{margin:"0 0 4px",fontSize:13.5}}>Direct top-up</h4>
              <p style={{fontSize:11}}>Diamonds sent to your account.</p>
            </button>
            <button className="method" aria-pressed={tm==="code"} onClick={()=>setTm("code")}>
              <span className="ck">{tm==="code" && <Icons.Check size={12} sw={2.6}/>}</span>
              <h4 style={{margin:"0 0 4px",fontSize:13.5}}>Get a code</h4>
              <p style={{fontSize:11}}>Redeem inside the game.</p>
            </button>
          </div>

          {tm === "direct" && (
            <div style={{ display:"grid", gridTemplateColumns:"1fr 110px", gap:10, marginTop:14 }}>
              <div className="field">
                <label>User ID</label>
                <input className="input" placeholder="312789045" value={uid} onChange={e=>setUid(e.target.value.replace(/\D/g,""))}/>
              </div>
              <div className="field">
                <label>Zone</label>
                <input className="input" placeholder="2155" value={zid} onChange={e=>setZid(e.target.value.replace(/\D/g,""))}/>
              </div>
              {uid.length >= 6 && zid.length >= 3 && (
                <div className="alert" style={{ gridColumn:"span 2", marginTop:0 }}>
                  <Icons.Check size={14} stroke="var(--success)" sw={2.4}/>
                  <span>Verified: <b>LinaG_★</b></span>
                </div>
              )}
            </div>
          )}
          {tm === "code" && (
            <div className="alert" style={{ marginTop:12 }}>
              <Icons.Info size={14} stroke="var(--brand)" sw={2.2}/>
              <span>You'll receive a redeem code after payment.</span>
            </div>
          )}
        </div>

        <h3 style={{ fontFamily:"Sora", fontSize:14, margin:"20px 18px 10px" }}>Choose package</h3>
        <div className="m-pkg-grid">
          {packages.slice(0,8).map(p => (
            <button key={p.id} className="pkg" aria-pressed={pkg?.id === p.id} onClick={()=>setPkg(p)}>
              {p.popular && <span className="tag popular">Popular</span>}
              {p.best && <span className="tag best">Best</span>}
              <div className="row1"><Icons.Diamond size={12} sw={2.2}/><span style={{ fontSize:10, fontWeight:600 }}>{game.currency}</span></div>
              <div className="amount" style={{fontSize:18}}>{p.amount.toLocaleString()}</div>
              {p.bonus > 0 ? <div className="bonus" style={{fontSize:10.5}}>+{p.bonus} bonus</div> : <div className="bonus" style={{visibility:"hidden",fontSize:10.5}}>·</div>}
              <div className="price" style={{fontSize:13}}>${p.priceUSD.toFixed(2)}<small>USD</small></div>
            </button>
          ))}
        </div>
      </div>

      <div className="m-bottom-bar">
        <div className="total"><span>Total</span><b>${total.toFixed(2)}</b></div>
        <button disabled={!ready} onClick={() => {
          setOrder({ game, pkg, topupMethod: tm, userId: uid, zoneId: zid, total, fee });
          go({ name:"payment" });
        }}>
          Continue <Icons.Arrow size={15} sw={2.2}/>
        </button>
      </div>
    </>
  );
}

function MobilePayment({ order, go, setReceipt }) {
  const [method, setMethod] = useM("khqr");
  const [bank, setBank] = useM("aba");
  const [card, setCard] = useM({ num:"", name:"", exp:"", cvc:"" });
  const [scanning, setScanning] = useM(false);

  const cardOK = card.num.replace(/\s/g,"").length >= 16 && card.exp.length >= 5 && card.cvc.length >= 3 && card.name.length > 2;
  const canPay = method === "khqr" || method === "bank" || (method === "card" && cardOK);

  function pay() {
    const code = "TPUP-" + Math.random().toString(36).slice(2,6).toUpperCase() + "-" +
                 Math.random().toString(36).slice(2,6).toUpperCase();
    setReceipt({ ...order, method, bank, code, ref: "TP-" + Math.floor(100000 + Math.random()*899999) });
    go({ name:"success" });
  }

  useEffM(() => {
    if (method !== "khqr" || !scanning) return;
    const t = setTimeout(pay, 1800);
    return () => clearTimeout(t);
  }, [method, scanning]);

  return (
    <>
      <div className="m-top" style={{ padding:"6px 12px 8px" }}>
        <button className="icon-btn" onClick={()=>go({ name:"detail", game: order.game })}><Icons.Back size={17}/></button>
        <div className="greet" style={{ textAlign:"center" }}>
          <b style={{ fontSize:15 }}>Payment</b>
          <span>${order.total.toFixed(2)} · {order.game.title}</span>
        </div>
        <span style={{ width:38 }}/>
      </div>

      <div className="m-content thin-scroll" style={{ padding:"4px 0 100px" }}>
        <div style={{ padding:"0 18px" }}>
          <div className="pay-grid">
            {AppData.PAYMENT_METHODS.map(m => {
              const Ico = Icons[m.icon];
              return (
                <button key={m.id} className="pay-method" aria-pressed={method===m.id} onClick={()=>setMethod(m.id)}>
                  <div className="pi" style={method===m.id?{background:"color-mix(in oklab, var(--brand) 12%, var(--surface-2))",color:"var(--brand)"}:null}>
                    <Ico size={20} sw={1.8}/>
                  </div>
                  <div className="lbl"><b>{m.label}</b><span>{m.sub}</span></div>
                </button>
              );
            })}
          </div>

          {method === "khqr" && (
            <div className="pay-detail" style={{ textAlign:"center" }}>
              <div className="qr" style={{ margin:"0 auto", width:220, height:220 }}><FakeQR size={196}/></div>
              <div style={{ marginTop: 10 }}>
                <span className="qr-timer"><span className="dot"/>Expires in 09:53</span>
              </div>
              <p style={{ fontSize:12, color:"var(--muted)", margin:"10px 0 12px" }}>Scan with any KHQR app — ABA, ACLEDA, Wing, Chip Mong.</p>
              <button className="btn-sm" onClick={()=>setScanning(true)}>{scanning ? "Waiting…" : "Simulate scan"}</button>
            </div>
          )}

          {method === "bank" && (
            <div className="pay-detail">
              <h4 style={{ margin:"0 0 8px", fontFamily:"Sora", fontSize:14 }}>Pick a bank</h4>
              <div className="bank-list">
                {AppData.BANKS.map(b => (
                  <button key={b.id} className="bank" aria-pressed={bank===b.id} onClick={()=>setBank(b.id)}>
                    <div className="bi" style={{ background:b.color }}>{b.name.split(" ").map(w=>w[0]).join("").slice(0,2)}</div>
                    <b style={{ fontSize:12 }}>{b.name}</b>
                  </button>
                ))}
              </div>
            </div>
          )}

          {method === "card" && (
            <div className="pay-detail">
              <div className="card-visual" style={{ marginBottom: 14 }}>
                <div className="brand-mark">VISA</div>
                <div className="chip"></div>
                <div className="num" style={{ fontSize:15 }}>{(card.num || "•••• •••• •••• ••••").padEnd(19,"•").slice(0,19)}</div>
                <div className="row" style={{ justifyContent:"space-between" }}>
                  <div><span>Holder</span><b>{card.name || "YOUR NAME"}</b></div>
                  <div><span>Exp</span><b>{card.exp || "MM/YY"}</b></div>
                </div>
              </div>
              <div className="field"><label>Card number</label>
                <input className="input mono" placeholder="4242 4242 4242 4242" value={card.num}
                  onChange={e => { const v = e.target.value.replace(/\D/g,"").slice(0,16); setCard({ ...card, num: v.replace(/(.{4})/g,"$1 ").trim() }); }}/>
              </div>
              <div className="field" style={{ marginTop:10 }}><label>Name</label>
                <input className="input" placeholder="Lina Sok" value={card.name} onChange={e=>setCard({...card,name:e.target.value.toUpperCase()})}/>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginTop:10 }}>
                <div className="field"><label>Expiry</label>
                  <input className="input mono" placeholder="MM/YY" value={card.exp}
                    onChange={e => { let v = e.target.value.replace(/\D/g,"").slice(0,4); if (v.length > 2) v = v.slice(0,2)+"/"+v.slice(2); setCard({ ...card, exp:v }); }}/>
                </div>
                <div className="field"><label>CVC</label>
                  <input className="input mono" placeholder="123" value={card.cvc} onChange={e=>setCard({...card,cvc:e.target.value.replace(/\D/g,"").slice(0,4)})}/>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="m-bottom-bar">
        <div className="total"><span>Total</span><b>${order.total.toFixed(2)}</b></div>
        <button disabled={!canPay || (method==="khqr" && scanning)} onClick={pay}>
          {method==="khqr" ? "I've paid" : method==="bank" ? "Continue to bank" : `Pay $${order.total.toFixed(2)}`}
        </button>
      </div>
    </>
  );
}

function MobileSuccess({ receipt, go }) {
  if (!receipt) return null;
  const isCode = receipt.topupMethod === "code";
  return (
    <div className="m-content thin-scroll" style={{ padding:"40px 18px 24px", textAlign:"center" }}>
      <div className="success-icon" style={{ margin:"20px auto 14px" }}><Icons.Check size={42} sw={2.6}/></div>
      <h2 style={{ fontFamily:"Sora", margin:0, fontSize:22 }}>Payment successful</h2>
      <p style={{ color:"var(--muted)", marginTop:6, fontSize:13 }}>Order <span className="mono">{receipt.ref}</span></p>

      {isCode ? (
        <div className="code-box" style={{ textAlign:"center" }}>
          <div className="lbl">Your redeem code</div>
          <div className="code" style={{ fontSize:16, letterSpacing:2 }}>{receipt.code}</div>
          <button className="btn-sm" onClick={()=>navigator.clipboard?.writeText(receipt.code)}><Icons.Copy size={13} sw={2.2}/>Copy</button>
        </div>
      ) : (
        <div className="code-box" style={{ textAlign:"center" }}>
          <div className="lbl">Direct delivery</div>
          <div style={{ fontFamily:"Sora", fontSize:15, fontWeight:600, margin:"8px 0 4px" }}>
            {receipt.pkg.amount.toLocaleString()}{receipt.pkg.bonus?` +${receipt.pkg.bonus}`:""} {receipt.game.currency}
          </div>
          <div className="muted" style={{ fontSize:11.5 }}>→ ID <span className="mono">{receipt.userId}</span> · Zone <span className="mono">{receipt.zoneId}</span></div>
          <div style={{ display:"flex",alignItems:"center",gap:8,justifyContent:"center",marginTop:12,color:"var(--success)",fontSize:12,fontWeight:500 }}>
            <span style={{ width:7,height:7,borderRadius:"50%",background:"var(--success)",animation:"pulse 1.4s infinite" }}/> Delivering…
          </div>
        </div>
      )}

      <div style={{ marginTop:20, display:"grid", gap:8 }}>
        <button className="cta" onClick={()=>go({ name:"home" })}>Back to home</button>
        <button className="cta ghost" onClick={()=>go({ name:"detail", game: receipt.game })}>Top up again</button>
      </div>
    </div>
  );
}

window.MobileApp = MobileApp;
