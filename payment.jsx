// payment.jsx — payment screen + success screen
const { useState: usePay, useEffect: useEffPay } = React;

function PaymentScreen({ order, go, setReceipt }) {
  const [method, setMethod] = usePay("khqr");
  const [bank, setBank] = usePay("aba");
  const [card, setCard] = usePay({ num:"", name:"", exp:"", cvc:"" });
  const [timer, setTimer] = usePay(599);
  const [scanning, setScanning] = usePay(false);

  useEffPay(() => {
    if (method !== "khqr") return;
    const t = setInterval(() => setTimer(s => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [method]);

  const fmtTimer = `${String(Math.floor(timer/60)).padStart(2,"0")}:${String(timer%60).padStart(2,"0")}`;

  const cardOK = card.num.replace(/\s/g,"").length >= 16 && card.exp.length >= 5 && card.cvc.length >= 3 && card.name.length > 2;
  const canPay = method === "khqr" || method === "bank" || (method === "card" && cardOK);

  function pay() {
    const code = "TPUP-" + Math.random().toString(36).slice(2,6).toUpperCase() + "-" +
                 Math.random().toString(36).slice(2,6).toUpperCase() + "-" +
                 Math.random().toString(36).slice(2,6).toUpperCase();
    setReceipt({ ...order, method, bank: bank, code, ref: "TP-" + Math.floor(100000 + Math.random()*899999) });
    go({ name: "success" });
  }

  // Auto-advance KHQR after 4s of "scanning"
  useEffPay(() => {
    if (method !== "khqr" || !scanning) return;
    const t = setTimeout(pay, 1800);
    return () => clearTimeout(t);
  }, [method, scanning]);

  return (
    <div className="detail">
      <div className="detail-main">
        <button className="btn-sm" onClick={() => go({ name: "detail", game: order.game })}><Icons.Back size={14} sw={2.2}/>Back</button>

        <div className="steps" style={{ marginTop: 16 }}>
          <div className="step done"><div className="num"><Icons.Check size={14} sw={2.6}/></div><div><div className="lbl">Step 1</div><div className="ttl">Package</div></div></div>
          <div className="step done"><div className="num"><Icons.Check size={14} sw={2.6}/></div><div><div className="lbl">Step 2</div><div className="ttl">Delivery</div></div></div>
          <div className="step active"><div className="num">3</div><div><div className="lbl">Step 3</div><div className="ttl">Payment</div></div></div>
        </div>

        <h3 style={{ fontFamily:"Sora", fontSize:18, margin:"22px 0 14px" }}>Choose payment method</h3>
        <div className="pay-grid">
          {AppData.PAYMENT_METHODS.map(m => {
            const Ico = Icons[m.icon];
            return (
              <button key={m.id} className="pay-method" aria-pressed={method === m.id} onClick={() => setMethod(m.id)}>
                <div className="pi" style={method === m.id ? { background:"color-mix(in oklab, var(--brand) 12%, var(--surface-2))", color:"var(--brand)" } : null}>
                  <Ico size={22} sw={1.8}/>
                </div>
                <div className="lbl"><b>{m.label}</b><span>{m.sub}</span></div>
                <div style={{ marginLeft:"auto" }}>
                  {method === m.id ?
                    <span style={{ width:22, height:22, borderRadius:"50%", background:"var(--brand)", color:"#fff", display:"grid", placeItems:"center" }}><Icons.Check size={13} sw={2.6}/></span>
                    : <span style={{ width:22, height:22, borderRadius:"50%", border:"1.5px solid var(--line-strong)", display:"inline-block" }}/>
                  }
                </div>
              </button>
            );
          })}
        </div>

        {method === "khqr" && (
          <div className="pay-detail">
            <div className="qr-wrap">
              <div className="qr"><FakeQR size={196}/></div>
              <div>
                <span className="qr-timer"><span className="dot"/>Expires in {fmtTimer}</span>
                <h4 style={{ margin:"12px 0 4px", fontFamily:"Sora", fontSize:16 }}>Scan with any KHQR-supported app</h4>
                <p className="muted" style={{ fontSize:12.5, margin:"0 0 12px" }}>ABA, ACLEDA, Wing, Chip Mong, TrueMoney, AC Leda Pay & more.</p>
                <div className="row gap-8" style={{ flexWrap:"wrap", gap:6 }}>
                  {AppData.BANKS.map(b => (
                    <span key={b.id} style={{ padding:"4px 10px", background:"var(--surface)", borderRadius:999, border:"1px solid var(--line)", fontSize:11.5, color:"var(--ink-2)", fontWeight:500 }}>{b.name}</span>
                  ))}
                </div>
                <button className="btn-sm" style={{ marginTop:12 }} onClick={() => setScanning(true)}>
                  {scanning ? "Waiting for payment…" : "Simulate scan"}
                </button>
              </div>
            </div>
          </div>
        )}

        {method === "bank" && (
          <div className="pay-detail">
            <h4 style={{ margin:"0 0 8px", fontFamily:"Sora", fontSize:15 }}>Pick your bank</h4>
            <div className="bank-list">
              {AppData.BANKS.map(b => (
                <button key={b.id} className="bank" aria-pressed={bank === b.id} onClick={() => setBank(b.id)}>
                  <div className="bi" style={{ background:b.color }}>{b.name.split(" ").map(w=>w[0]).join("").slice(0,2)}</div>
                  <b>{b.name}</b>
                </button>
              ))}
            </div>
            <div className="alert" style={{ marginTop: 14 }}>
              <Icons.Info size={16} stroke="var(--brand)" sw={2.2}/>
              <div>You'll be redirected to <b>{AppData.BANKS.find(b=>b.id===bank).name}</b> to confirm the transfer of <b>${order.total.toFixed(2)}</b>.</div>
            </div>
          </div>
        )}

        {method === "card" && (
          <div className="pay-detail">
            <div className="card-form">
              <div className="card-visual span2">
                <div className="brand-mark">VISA</div>
                <div className="chip"></div>
                <div className="num">{(card.num || "•••• •••• •••• ••••").padEnd(19,"•").slice(0,19)}</div>
                <div className="row" style={{ justifyContent:"space-between" }}>
                  <div><span>Card holder</span><b>{card.name || "YOUR NAME"}</b></div>
                  <div><span>Expires</span><b>{card.exp || "MM/YY"}</b></div>
                </div>
              </div>
              <div className="field span2">
                <label>Card number</label>
                <input className="input mono" placeholder="4242 4242 4242 4242"
                  value={card.num}
                  onChange={e => {
                    const v = e.target.value.replace(/\D/g,"").slice(0,16);
                    setCard({ ...card, num: v.replace(/(.{4})/g,"$1 ").trim() });
                  }}/>
              </div>
              <div className="field span2">
                <label>Cardholder name</label>
                <input className="input" placeholder="Lina Sok" value={card.name} onChange={e=>setCard({...card, name:e.target.value.toUpperCase()})}/>
              </div>
              <div className="field">
                <label>Expiry</label>
                <input className="input mono" placeholder="MM/YY" value={card.exp}
                  onChange={e => {
                    let v = e.target.value.replace(/\D/g,"").slice(0,4);
                    if (v.length > 2) v = v.slice(0,2) + "/" + v.slice(2);
                    setCard({ ...card, exp: v });
                  }}/>
              </div>
              <div className="field">
                <label>CVC</label>
                <input className="input mono" placeholder="123" value={card.cvc} onChange={e=>setCard({...card, cvc:e.target.value.replace(/\D/g,"").slice(0,4)})}/>
              </div>
            </div>
            <div className="alert" style={{ marginTop: 14 }}>
              <Icons.Lock size={16} stroke="var(--success)" sw={2.2}/>
              <div>Secured by 3-D Secure 2.0. Your card details never touch our servers.</div>
            </div>
          </div>
        )}
      </div>

      <aside className="summary">
        <h4>Final review</h4>
        <div className="sum-row"><span>Game</span><b>{order.game.title}</b></div>
        <div className="sum-row"><span>Package</span><b>{order.pkg.amount.toLocaleString()}{order.pkg.bonus?` +${order.pkg.bonus}`:""} {order.game.currency}</b></div>
        <div className="sum-row"><span>Method</span><b>{order.topupMethod === "direct" ? "Direct top-up" : "Voucher code"}</b></div>
        {order.topupMethod === "direct" && (
          <div className="sum-row"><span>User · Zone</span><b className="mono">{order.userId} · {order.zoneId}</b></div>
        )}
        <div className="sum-row"><span>Service fee</span><b>${order.fee.toFixed(2)}</b></div>
        <div className="sum-total">
          <div className="label">Total</div>
          <div className="val">${order.total.toFixed(2)}<small>USD</small></div>
        </div>
        <button className="cta" disabled={!canPay || (method==="khqr" && scanning)} onClick={pay}>
          {method === "khqr" ? <><Icons.Qr size={16}/>I've paid via KHQR</> :
           method === "bank" ? <><Icons.Bank size={16}/>Pay with {AppData.BANKS.find(b=>b.id===bank).name}</> :
                               <><Icons.Lock size={16}/>Pay ${order.total.toFixed(2)}</>}
        </button>
        <div className="assurance">
          <Icons.Shield size={14} stroke="var(--success)" sw={2}/>
          <span>SSL encrypted · PCI-DSS · Money-back guarantee</span>
        </div>
      </aside>
    </div>
  );
}

function SuccessScreen({ receipt, go }) {
  const [copied, setCopied] = usePay(false);
  if (!receipt) return null;
  const isCode = receipt.topupMethod === "code";

  return (
    <div className="success-wrap">
      <div className="success-card">
        <div className="success-icon"><Icons.Check size={42} sw={2.6}/></div>
        <h2>Payment successful</h2>
        <p>Order <span className="mono">{receipt.ref}</span> · {new Date().toLocaleString()}</p>

        {isCode ? (
          <div className="code-box">
            <div className="lbl">Your redeem code</div>
            <div className="code">{receipt.code}</div>
            <div className="code-actions">
              <button className="btn-sm" onClick={() => { navigator.clipboard?.writeText(receipt.code); setCopied(true); setTimeout(()=>setCopied(false), 1500); }}>
                <Icons.Copy size={13} sw={2.2}/>{copied ? "Copied!" : "Copy code"}
              </button>
              <button className="btn-sm"><Icons.Receipt size={13} sw={2.2}/>Email me</button>
            </div>
            <p className="muted" style={{ fontSize:11.5, margin:"12px 0 0" }}>Open {receipt.game.title} → Top-up center → Redeem code.</p>
          </div>
        ) : (
          <div className="code-box">
            <div className="lbl">Direct delivery</div>
            <div style={{ fontFamily:"Sora", fontSize: 18, fontWeight:600, margin:"8px 0 4px" }}>
              {receipt.pkg.amount.toLocaleString()}{receipt.pkg.bonus?` +${receipt.pkg.bonus}`:""} {receipt.game.currency} → ID <span className="mono">{receipt.userId}</span> · Zone <span className="mono">{receipt.zoneId}</span>
            </div>
            <p className="muted" style={{ fontSize:12, margin:0 }}>Diamonds typically appear in-game within 30 seconds.</p>
            <div style={{ display:"flex", alignItems:"center", gap:10, justifyContent:"center", marginTop:14, color:"var(--success)", fontSize:12.5, fontWeight:500 }}>
              <span style={{ width:8, height:8, borderRadius:"50%", background:"var(--success)", animation:"pulse 1.4s infinite" }}/> Delivery in progress…
            </div>
          </div>
        )}

        <div style={{ display:"flex", gap:10, justifyContent:"center", marginTop: 20 }}>
          <button className="cta ghost" style={{ width:"auto", padding:"0 18px", marginTop:0 }} onClick={() => go({ name: "home" })}>Back to browse</button>
          <button className="cta" style={{ width:"auto", padding:"0 18px", marginTop:0 }} onClick={() => go({ name: "detail", game: receipt.game })}>Top up again</button>
        </div>
      </div>

      <aside className="receipt">
        <h4>Receipt</h4>
        <div className="row"><span>Order</span><b className="mono" style={{marginLeft:"auto"}}>{receipt.ref}</b></div>
        <div className="row"><span>Item</span><b style={{marginLeft:"auto"}}>{receipt.game.title}</b></div>
        <div className="row"><span>Package</span><b style={{marginLeft:"auto"}}>{receipt.pkg.amount.toLocaleString()}{receipt.pkg.bonus?` +${receipt.pkg.bonus}`:""}</b></div>
        <div className="row"><span>Method</span><b style={{marginLeft:"auto"}}>{receipt.method === "khqr" ? "KHQR" : receipt.method === "bank" ? AppData.BANKS.find(b=>b.id===receipt.bank).name : "Visa ••4242"}</b></div>
        <div className="row"><span>Service fee</span><b style={{marginLeft:"auto"}}>${receipt.fee.toFixed(2)}</b></div>
        <div className="row total"><span>Paid</span><b style={{marginLeft:"auto"}}>${receipt.total.toFixed(2)}</b></div>
        <div className="assurance" style={{ marginTop: 14 }}>
          <Icons.Receipt size={14}/><span>A copy was sent to lina@example.com</span>
        </div>
      </aside>
    </div>
  );
}

window.PaymentScreen = PaymentScreen;
window.SuccessScreen = SuccessScreen;
