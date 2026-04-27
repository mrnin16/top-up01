// app-styles.jsx — styles specific to the Top-up product UI (injected into both desktop & mobile)
const APP_STYLES = `
.app{ height:100%; background: var(--bg); color: var(--ink);
  display:flex; flex-direction:column; font-size:14px; }

/* ── Top nav (desktop) ── */
.topnav{ display:flex; align-items:center; gap:24px;
  padding: 14px 32px; background: var(--surface); border-bottom: 1px solid var(--line);
  position: sticky; top:0; z-index: 20; }
.brand{ display:flex; align-items:center; gap:10px; font-family:'Sora',sans-serif; font-weight:700; letter-spacing:-.01em; font-size:17px; }
.brand-mark{ width:30px; height:30px; border-radius:9px;
  background: linear-gradient(135deg, var(--brand), color-mix(in oklab, var(--brand) 50%, #000));
  display:grid; place-items:center; color:#fff; box-shadow: 0 4px 10px color-mix(in oklab, var(--brand) 35%, transparent); }
.nav-links{ display:flex; gap:4px; margin-left:8px; }
.nav-links a{ padding:8px 12px; color:var(--muted); border-radius:8px; font-weight:500; font-size:13px; text-decoration:none; }
.nav-links a.active{ color:var(--ink); background: var(--surface-2); }
.nav-search{ flex:1; max-width: 520px; margin: 0 12px; position:relative; }
.nav-search input{
  width:100%; height:40px; border-radius:10px; border:1px solid var(--line);
  background: var(--surface-2); padding: 0 14px 0 40px; color:var(--ink); outline:none; font-size:13.5px;
}
.nav-search input::placeholder{ color: var(--muted-2); }
.nav-search input:focus{ border-color: color-mix(in oklab, var(--brand) 60%, transparent); background: var(--surface); box-shadow: 0 0 0 4px color-mix(in oklab, var(--brand) 15%, transparent); }
.nav-search .si{ position:absolute; left:12px; top:11px; color: var(--muted); }
.nav-icons{ display:flex; align-items:center; gap:6px; }
.icon-btn{
  width:38px; height:38px; border-radius:10px; border:1px solid var(--line);
  background: var(--surface); color: var(--ink-2); display:grid; place-items:center; position:relative;
  transition: background .15s;
}
.icon-btn:hover{ background: var(--surface-2); }
.icon-btn .badge{ position:absolute; top:-4px; right:-4px; min-width:16px; height:16px; padding:0 4px;
  background: var(--brand); color:#fff; font-size:10px; font-weight:600; border-radius:999px;
  display:inline-flex; align-items:center; justify-content:center; border:2px solid var(--surface); }
.user-chip{ display:flex; align-items:center; gap:8px; padding: 4px 10px 4px 4px; border:1px solid var(--line);
  border-radius:999px; background: var(--surface); font-size:12.5px; font-weight:500; }
.avatar{ width:30px; height:30px; border-radius:50%;
  background: linear-gradient(135deg, #fbbf24, #ef4444); color:#fff; display:grid; place-items:center; font-weight:600; font-size:12px; }
.lang-pill{ display:inline-flex; align-items:center; gap:6px; padding: 7px 10px;
  border:1px solid var(--line); border-radius:999px; background: var(--surface);
  font-size:12px; color: var(--ink-2); font-weight:500; }

/* ── Hero ── */
.hero{ padding: 22px 32px 6px; }
.hero-card{
  position:relative; overflow:hidden;
  border-radius: var(--radius-xl); padding: 30px 32px;
  background:
    radial-gradient(800px 320px at 0% 0%, color-mix(in oklab, var(--brand) 30%, transparent), transparent 60%),
    radial-gradient(700px 360px at 100% 100%, color-mix(in oklab, var(--accent) 24%, transparent), transparent 60%),
    linear-gradient(135deg, #0b1226, #1a2244 60%, #0b1226);
  color:#fff;
  display:grid; grid-template-columns: 1.2fr 1fr; gap: 24px; align-items:center;
  min-height: 200px;
}
.hero-eyebrow{ display:inline-flex; align-items:center; gap:6px; padding: 5px 10px;
  background: rgba(255,255,255,.1); border:1px solid rgba(255,255,255,.18);
  border-radius:999px; font-size:11.5px; letter-spacing:.04em; text-transform:uppercase; color:#dbe1ff; }
.hero h2{ margin: 12px 0 8px; font-family:'Sora',sans-serif; font-weight:700; font-size: 34px; line-height:1.05; letter-spacing:-.02em; max-width: 520px; }
.hero p{ margin: 0; color: #c9d1ee; max-width: 440px; font-size:14px; line-height:1.6; }
.hero-stats{ display:flex; gap:14px; margin-top: 18px; }
.hero-stat{ background: rgba(255,255,255,.08); border:1px solid rgba(255,255,255,.12);
  border-radius: 12px; padding: 10px 14px; min-width: 110px; }
.hero-stat b{ display:block; font-family:'Sora',sans-serif; font-size:18px; }
.hero-stat span{ color:#a8b1d4; font-size:11px; }
.hero-art{ position:relative; height: 220px; }
.hero-art .gem{ position:absolute; width: 92px; height: 92px; border-radius: 16px;
  background: linear-gradient(135deg, rgba(255,255,255,.18), rgba(255,255,255,.04));
  border:1px solid rgba(255,255,255,.18); backdrop-filter: blur(12px);
  display:grid; place-items:center; box-shadow: 0 30px 50px rgba(0,0,0,.35); }
.hero-art .gem.big{ right: 4%; top: 8%; width:140px; height:140px; transform: rotate(8deg); }
.hero-art .gem.mid{ right: 38%; top: 32%; transform: rotate(-12deg); }
.hero-art .gem.sm { right: 60%; top: 8%;  width:64px;  height:64px; transform: rotate(20deg); }

/* ── Categories ── */
.section{ padding: 16px 32px; }
.section-head{ display:flex; align-items:center; justify-content:space-between; margin: 6px 0 14px; }
.section-head h3{ margin:0; font-family:'Sora',sans-serif; font-weight:700; font-size:18px; letter-spacing:-.01em; }
.section-head a{ color: var(--muted); font-size:12.5px; font-weight:500; text-decoration:none; display:inline-flex; align-items:center; gap:4px; }
.cat-row{ display:flex; gap:8px; flex-wrap: wrap; }
.chip{
  display:inline-flex; align-items:center; gap:8px; padding: 9px 14px;
  border-radius: 999px; border:1px solid var(--line); background: var(--surface);
  font-size:13px; color: var(--ink-2); font-weight:500;
  transition: background .15s, color .15s, border-color .15s;
}
.chip[aria-pressed="true"]{ background: var(--ink); color: var(--surface); border-color: var(--ink); }
.chip[aria-pressed="true"] svg{ color: var(--surface); }

/* ── Game grid ── */
.game-grid{ display:grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 14px; }
.game{ position:relative; border-radius: var(--radius-lg); overflow:hidden; background: var(--surface);
  border:1px solid var(--line); box-shadow: var(--shadow-sm); transition: transform .15s ease, box-shadow .2s ease; }
.game:hover{ transform: translateY(-2px); box-shadow: var(--shadow-md); border-color: var(--line-strong); }
.game .art{ aspect-ratio: 4/5; position:relative; overflow:hidden; }
.game .art::after{ content:""; position:absolute; inset:0;
  background: linear-gradient(180deg, transparent 50%, rgba(0,0,0,.55)); }
.game .emblem{ position:absolute; inset:0; display:grid; place-items:center;
  font-family:'Sora',sans-serif; font-weight:800; font-size:42px; color: rgba(255,255,255,.92);
  letter-spacing:-.02em; text-shadow: 0 6px 24px rgba(0,0,0,.4); }
.game .ribbon{ position:absolute; top:10px; left:10px; padding: 4px 8px; border-radius: 6px;
  background: rgba(255,255,255,.92); color:#000; font-size:10px; font-weight:700; letter-spacing:.04em; text-transform:uppercase;
  display:inline-flex; align-items:center; gap:4px; }
.game .ribbon.hot{ background: var(--accent); color:#fff; }
.game .ribbon.new{ background: var(--brand); color:#fff; }
.game .meta{ padding: 10px 12px 12px; }
.game .meta b{ display:block; font-size:13.5px; font-weight:600; }
.game .meta span{ color: var(--muted); font-size:11.5px; }

/* ── Detail page ── */
.detail{ display:grid; grid-template-columns: 1fr 380px; gap: 28px; padding: 24px 32px; align-items:start; }
.detail-main{ min-width:0; }
.banner{ position:relative; border-radius: var(--radius-xl); overflow:hidden; padding: 28px 28px 22px;
  display:flex; gap: 20px; align-items:center; min-height: 180px; color:#fff; }
.banner::after{ content:""; position:absolute; inset:0;
  background: linear-gradient(135deg, rgba(0,0,0,0), rgba(0,0,0,.35)); }
.banner > *{ position:relative; z-index:1; }
.banner .logo{ width: 110px; height: 110px; border-radius: 22px; background: rgba(255,255,255,.12);
  border: 1px solid rgba(255,255,255,.18); backdrop-filter: blur(10px);
  display:grid; place-items:center; font-family:'Sora',sans-serif; font-weight:800; font-size:38px; }
.banner h1{ margin:0; font-family:'Sora',sans-serif; font-size:28px; letter-spacing:-.01em; }
.banner p{ margin: 4px 0 0; color: rgba(255,255,255,.82); font-size: 13.5px; }
.banner-tags{ display:flex; gap:8px; margin-top:10px; }
.banner-tags span{ padding: 4px 10px; background: rgba(255,255,255,.16); border:1px solid rgba(255,255,255,.18);
  border-radius:999px; font-size:11.5px; }

.steps{ display:flex; gap:8px; margin: 22px 0 14px; }
.step{ flex:1; display:flex; align-items:center; gap:10px;
  padding: 12px 14px; border-radius: 12px; background: var(--surface); border:1px solid var(--line); }
.step.active{ border-color: color-mix(in oklab, var(--brand) 60%, var(--line)); box-shadow: 0 0 0 4px color-mix(in oklab, var(--brand) 12%, transparent); }
.step.done{ background: color-mix(in oklab, var(--brand) 8%, var(--surface)); }
.step .num{ width:24px; height:24px; border-radius:999px; background: var(--surface-2); color: var(--muted);
  display:grid; place-items:center; font-weight:600; font-size:12px; flex:none; }
.step.active .num{ background: var(--brand); color:#fff; }
.step.done .num{ background: var(--success); color:#fff; }
.step .lbl{ font-size:11.5px; color: var(--muted); }
.step .ttl{ font-size:13px; font-weight:600; }

.method-toggle{ display:grid; grid-template-columns: 1fr 1fr; gap:12px; }
.method{ position:relative; padding:16px; border-radius: var(--radius); border:1.5px solid var(--line);
  background: var(--surface); cursor:default;
  transition: border-color .15s, background .15s, box-shadow .15s; }
.method[aria-pressed="true"]{ border-color: var(--brand); background: color-mix(in oklab, var(--brand) 5%, var(--surface));
  box-shadow: 0 0 0 4px color-mix(in oklab, var(--brand) 12%, transparent); }
.method .tag{ font-size:10.5px; font-weight:600; letter-spacing:.05em; text-transform:uppercase; color: var(--muted); }
.method h4{ margin: 6px 0 4px; font-size:14.5px; font-family:'Sora',sans-serif; }
.method p{ margin:0; font-size:12px; color: var(--muted); line-height:1.45; }
.method .ck{ position:absolute; top:14px; right:14px; width:22px; height:22px; border-radius:50%;
  border:1.5px solid var(--line-strong); display:grid; place-items:center; }
.method[aria-pressed="true"] .ck{ background: var(--brand); border-color: var(--brand); color:#fff; }

.id-fields{ display:grid; grid-template-columns: 1fr 140px; gap: 12px; }
.field{ display:flex; flex-direction:column; gap:6px; }
.field label{ font-size: 12px; font-weight:500; color: var(--ink-2); }
.field .hint{ font-size: 11.5px; color: var(--muted); }
.input{ height: 44px; border-radius: 10px; border:1px solid var(--line); background: var(--surface);
  padding: 0 14px; font-size:14px; outline:none; color: var(--ink); }
.input:focus{ border-color: color-mix(in oklab, var(--brand) 60%, var(--line)); box-shadow: 0 0 0 4px color-mix(in oklab, var(--brand) 15%, transparent); background: var(--surface); }
.input.invalid{ border-color: var(--danger); box-shadow: 0 0 0 4px color-mix(in oklab, var(--danger) 12%, transparent); }
.input-group{ position:relative; }
.input-group .check{ position:absolute; right:12px; top:12px; color: var(--success); }

.pkg-grid{ display:grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 10px; }
.pkg{ position:relative; padding: 14px 14px 12px; border-radius: 12px; border: 1.5px solid var(--line);
  background: var(--surface); cursor:default; transition: transform .12s ease, border-color .15s ease; }
.pkg:hover{ border-color: var(--line-strong); transform: translateY(-1px); }
.pkg[aria-pressed="true"]{ border-color: var(--brand); background: color-mix(in oklab, var(--brand) 5%, var(--surface));
  box-shadow: 0 0 0 4px color-mix(in oklab, var(--brand) 10%, transparent); }
.pkg .row1{ display:flex; align-items:center; gap:6px; color: var(--brand); font-weight:600; }
.pkg .amount{ font-family:'Sora',sans-serif; font-size: 22px; font-weight:700; letter-spacing:-.01em; color: var(--ink); margin: 6px 0 2px; }
.pkg .bonus{ font-size: 11.5px; color: var(--success); font-weight:500; }
.pkg .price{ margin-top: 8px; padding-top: 8px; border-top: 1px dashed var(--line);
  display:flex; align-items:center; justify-content:space-between; font-weight:600; font-size:13.5px; }
.pkg .price small{ color: var(--muted); font-size:10.5px; font-weight:500; }
.pkg .tag{ position:absolute; top:-8px; left:14px; padding: 3px 8px; font-size:10px; font-weight:700;
  letter-spacing:.05em; text-transform:uppercase; border-radius:6px; }
.pkg .tag.popular{ background: var(--accent); color:#fff; }
.pkg .tag.best{ background: var(--brand); color:#fff; }

/* ── Right summary ── */
.summary{ position: sticky; top: 80px;
  background: var(--surface); border:1px solid var(--line); border-radius: var(--radius-lg); padding: 20px; box-shadow: var(--shadow-sm); }
.summary h4{ margin: 0 0 14px; font-family:'Sora',sans-serif; font-size:15px; }
.sum-row{ display:flex; justify-content:space-between; padding: 10px 0; border-bottom:1px dashed var(--line); font-size: 13.5px; }
.sum-row span:first-child{ color: var(--muted); }
.sum-total{ display:flex; align-items:baseline; justify-content:space-between; margin-top: 14px; }
.sum-total .label{ color: var(--muted); font-size: 12px; }
.sum-total .val{ font-family:'Sora',sans-serif; font-weight: 700; font-size: 26px; letter-spacing: -.02em; }
.sum-total .val small{ font-size:13px; color: var(--muted); margin-left: 4px; font-weight:500; }
.cta{ width:100%; height: 50px; border-radius: 12px; background: var(--brand); color: var(--brand-ink); border:0;
  font-weight: 600; font-size: 14.5px; margin-top: 14px; display:inline-flex; align-items:center; justify-content:center; gap:8px;
  box-shadow: 0 8px 16px -4px color-mix(in oklab, var(--brand) 35%, transparent);
  transition: opacity .15s, background .15s, box-shadow .15s; }
.cta[disabled]{ background: var(--surface-2); color: var(--muted-2); box-shadow:none; cursor: not-allowed; }
.cta.ghost{ background: var(--surface); color: var(--ink); border:1px solid var(--line); box-shadow:none; }
.assurance{ display:flex; align-items:center; gap:8px; margin-top: 12px; padding: 10px;
  background: var(--surface-2); border-radius: 10px; font-size:11.5px; color: var(--muted); }

/* ── Payment ── */
.pay-grid{ display:grid; grid-template-columns: 1fr; gap: 12px; }
.pay-method{ display:flex; align-items:center; gap:14px; padding: 14px;
  border-radius: 12px; border: 1.5px solid var(--line); background: var(--surface);
  transition: border-color .15s, background .15s, box-shadow .15s; }
.pay-method[aria-pressed="true"]{ border-color: var(--brand); background: color-mix(in oklab, var(--brand) 5%, var(--surface)); box-shadow: 0 0 0 4px color-mix(in oklab, var(--brand) 10%, transparent); }
.pay-method .pi{ width:46px; height:46px; border-radius:10px; background: var(--surface-2); display:grid; place-items:center; flex:none; }
.pay-method .lbl b{ display:block; font-size:14px; font-weight:600; }
.pay-method .lbl span{ font-size:12px; color:var(--muted); }

.pay-detail{ background: var(--surface-2); border:1px dashed var(--line); border-radius: 14px; padding: 18px; margin-top: 14px; }

.qr-wrap{ display:grid; grid-template-columns: 220px 1fr; gap:24px; align-items:center; }
.qr{
  width: 220px; height: 220px; background: #fff; border-radius: 14px; padding: 12px;
  border: 1px solid var(--line); position:relative; box-shadow: var(--shadow-sm);
}
.qr svg{ display:block; }
.qr-timer{ display:inline-flex; align-items:center; gap:6px; padding: 6px 10px;
  background: var(--surface); border-radius:999px; font-size:12px; font-weight:600; color: var(--ink);
  border:1px solid var(--line); }
.qr-timer .dot{ width:6px; height:6px; border-radius:50%; background: var(--success); animation: pulse 1.4s infinite; }
@keyframes pulse{ 50%{ transform: scale(1.5); opacity:.4; } }

.bank-list{ display:grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top:14px; }
.bank{ display:flex; align-items:center; gap:10px; padding: 12px; border-radius: 10px;
  background: var(--surface); border:1.5px solid var(--line);
  transition: border-color .15s, box-shadow .15s; }
.bank[aria-pressed="true"]{ border-color: var(--brand); box-shadow: 0 0 0 4px color-mix(in oklab, var(--brand) 10%, transparent); }
.bank .bi{ width: 32px; height: 32px; border-radius:8px; display:grid; place-items:center; color:#fff; font-weight:700; font-size:12px; flex:none;
  font-family:'Sora',sans-serif; }
.bank b{ font-size:13px; }

.card-form{ display:grid; grid-template-columns: 1fr 1fr; gap:12px; margin-top:14px; }
.card-form .span2{ grid-column: span 2; }
.card-visual{ position:relative; height: 180px; border-radius: 16px; overflow:hidden; padding: 18px;
  background: linear-gradient(135deg, #1a2244, #0b1226 60%); color:#fff; box-shadow: var(--shadow-md); }
.card-visual::before{ content:""; position:absolute; right:-30px; top:-30px; width:160px; height:160px; border-radius:50%;
  background: radial-gradient(circle, color-mix(in oklab, var(--brand) 50%, transparent), transparent 70%); }
.card-visual .chip{ width:36px; height:26px; border-radius:6px; background: linear-gradient(135deg,#facc15,#a16207);
  border:1px solid rgba(0,0,0,.2); padding:0; display:block; }
.card-visual .num{ font-family:'JetBrains Mono', monospace; font-size:18px; letter-spacing:2px; margin-top: 30px; }
.card-visual .row{ display:flex; justify-content:space-between; margin-top: 16px; font-size: 11px; color: rgba(255,255,255,.7); text-transform:uppercase; letter-spacing:.06em; }
.card-visual .row b{ display:block; color:#fff; font-size:12px; margin-top:2px; letter-spacing:1px; }
.card-visual .brand-mark{ position:absolute; top:18px; right:18px; font-family:'Sora',sans-serif; font-weight:800; font-size:14px; letter-spacing:.04em; }

/* ── Success ── */
.success-wrap{ display:grid; grid-template-columns: 1fr 380px; gap: 28px; padding: 36px 32px; align-items:start; }
.success-card{ background: var(--surface); border-radius: var(--radius-xl); padding: 36px; border:1px solid var(--line); box-shadow: var(--shadow-md); text-align:center; }
.success-icon{ width: 84px; height: 84px; border-radius: 50%; background: color-mix(in oklab, var(--success) 18%, transparent);
  display:grid; place-items:center; margin: 0 auto 16px; color: var(--success); position:relative; }
.success-icon::after{ content:""; position:absolute; inset:-10px; border-radius:50%;
  border:2px solid color-mix(in oklab, var(--success) 35%, transparent); animation: ring 1.6s infinite; }
@keyframes ring{ from{ transform: scale(.7); opacity:1;} to{ transform: scale(1.2); opacity:0;} }
.success-card h2{ margin:0; font-family:'Sora',sans-serif; font-size:24px; }
.success-card p{ color: var(--muted); margin: 6px 0 0; font-size: 13.5px; }
.code-box{ margin: 22px auto 0; max-width: 460px; background: var(--surface-2); border:1px dashed var(--line-strong);
  border-radius: 14px; padding: 18px; }
.code-box .lbl{ font-size:11px; color: var(--muted); text-transform:uppercase; letter-spacing:.06em; }
.code-box .code{ font-family:'JetBrains Mono',monospace; font-size: 22px; font-weight:600; letter-spacing: 4px; margin: 6px 0 12px; }
.code-actions{ display:flex; gap:8px; justify-content:center; }
.btn-sm{ padding: 8px 14px; border-radius: 8px; border:1px solid var(--line); background: var(--surface); font-size:12.5px; font-weight:500;
  display:inline-flex; align-items:center; gap:6px; }

.receipt{ background: var(--surface); border:1px solid var(--line); border-radius: var(--radius-lg); padding: 20px; box-shadow: var(--shadow-sm); }
.receipt h4{ margin: 0 0 14px; font-family:'Sora',sans-serif; font-size:15px; }
.receipt .row{ display:flex; justify-content:space-between; padding: 9px 0; border-bottom:1px dashed var(--line); font-size:13px; }
.receipt .row span:first-child{ color: var(--muted); }
.receipt .row b{ font-weight:600; }
.receipt .row.total{ border:0; padding-top: 14px; }
.receipt .row.total b{ font-family:'Sora',sans-serif; font-size:18px; }

/* ── Mobile-only helpers ── */
.m-app{ height:100%; display:flex; flex-direction:column; background: var(--bg); }
.m-top{ padding: 6px 18px 12px; display:flex; align-items:center; justify-content:space-between; }
.m-top .greet b{ font-family:'Sora',sans-serif; font-size:18px; }
.m-top .greet span{ display:block; font-size:11.5px; color: var(--muted); }
.m-search{ padding: 0 18px; }
.m-search-inner{ position:relative; }
.m-search input{ width:100%; height:44px; border-radius:12px; border:1px solid var(--line); background: var(--surface);
  padding: 0 14px 0 42px; outline:none; font-size:14px; }
.m-search .si{ position:absolute; left:14px; top:13px; color: var(--muted); }
.m-content{ flex:1; overflow-y:auto; padding: 0 0 90px; }
.m-content::-webkit-scrollbar{ display:none; }
.m-section{ padding: 18px 18px 4px; }
.m-section h3{ margin: 0 0 10px; font-family:'Sora',sans-serif; font-size:15px; }
.m-cats{ display:flex; gap:8px; padding: 0 18px 4px; overflow-x:auto; scrollbar-width:none; }
.m-cats::-webkit-scrollbar{ display:none; }
.m-hero{ margin: 14px 18px 4px; border-radius: 18px; padding: 18px;
  background: linear-gradient(135deg, var(--brand), color-mix(in oklab, var(--brand) 50%, #000));
  color:#fff; position:relative; overflow:hidden; }
.m-hero h2{ margin:0; font-family:'Sora',sans-serif; font-size:18px; max-width: 220px; line-height:1.2; }
.m-hero p{ margin: 6px 0 12px; font-size:12px; color: rgba(255,255,255,.85); max-width: 220px; }
.m-hero .gem{ position:absolute; right: -10px; top: -10px; width:120px; height:120px; opacity:.5; }
.m-hero button{ background: rgba(255,255,255,.16); border:1px solid rgba(255,255,255,.22); color:#fff;
  padding: 8px 14px; border-radius: 10px; font-size:12.5px; font-weight:500; }
.m-grid{ display:grid; grid-template-columns: repeat(3, 1fr); gap: 10px; padding: 0 18px; }
.m-grid .game .meta{ padding:8px 10px 10px; }
.m-grid .game .meta b{ font-size:11px; }
.m-grid .game .meta span{ font-size:10px; }
.m-grid .game .emblem{ font-size: 26px; }

.m-tab{ position:absolute; bottom: 12px; left: 12px; right: 12px; height: 64px;
  background: var(--surface); border:1px solid var(--line); border-radius: 18px; display:flex;
  box-shadow: var(--shadow-md); padding: 6px;
}
.m-tab button{ flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:2px;
  background: transparent; border:0; color: var(--muted); font-size: 10.5px; font-weight:500; border-radius: 12px;
  transition: color .15s, background .15s; }
.m-tab button.active{ color: var(--brand); background: color-mix(in oklab, var(--brand) 8%, transparent); }

.m-detail-banner{ height: 220px; padding: 18px; color:#fff; position:relative;
  display:flex; flex-direction:column; justify-content:flex-end; }
.m-detail-banner::after{ content:""; position:absolute; inset:0; background: linear-gradient(180deg, transparent, rgba(0,0,0,.4)); }
.m-detail-banner > *{ position:relative; z-index:1; }
.m-detail-banner h1{ margin: 0; font-family:'Sora',sans-serif; font-size:22px; }
.m-detail-banner .back{ position:absolute; top: 14px; left: 14px; width: 38px; height:38px; border-radius:12px;
  background: rgba(0,0,0,.35); backdrop-filter: blur(6px); display:grid; place-items:center; color:#fff; z-index:2; border:0; }
.m-detail-banner .logo{ width: 64px; height: 64px; border-radius: 16px; background: rgba(255,255,255,.18);
  border:1px solid rgba(255,255,255,.22); display:grid; place-items:center; font-family:'Sora',sans-serif; font-weight:800; font-size:22px; margin-bottom: 10px; }

.m-pkg-grid{ display:grid; grid-template-columns: 1fr 1fr; gap: 10px; padding: 0 18px; }
.m-bottom-bar{
  position: sticky; bottom: 0; left:0; right:0; padding: 14px 18px;
  background: color-mix(in oklab, var(--surface) 92%, transparent);
  backdrop-filter: blur(16px); border-top: 1px solid var(--line);
  display:flex; align-items:center; justify-content:space-between; gap: 12px; z-index: 5;
}
.m-bottom-bar .total b{ display:block; font-family:'Sora',sans-serif; font-size:18px; }
.m-bottom-bar .total span{ font-size:11px; color:var(--muted); }
.m-bottom-bar button{ flex:1; max-width: 220px; height: 48px; border-radius: 12px; background: var(--brand); color:#fff;
  border:0; font-weight:600; font-size:14px; display:inline-flex; align-items:center; justify-content:center; gap:8px; }
.m-bottom-bar button[disabled]{ background: var(--surface-2); color: var(--muted-2); }

/* Modal */
.modal-back{ position:absolute; inset:0; background: rgba(8,12,24,.5); backdrop-filter: blur(4px); z-index: 50; display:flex; align-items:flex-end; }
.sheet{ width:100%; background: var(--surface); border-radius: 22px 22px 0 0; padding: 20px; max-height: 85%; overflow-y:auto;
  box-shadow: 0 -10px 40px rgba(0,0,0,.2); }
.sheet .grab{ width: 36px; height:4px; background: var(--line-strong); border-radius: 999px; margin: 0 auto 14px; }

/* Helpers */
.row{ display:flex; }
.between{ justify-content: space-between; align-items: center; }
.gap-8{ gap:8px; }
.muted{ color: var(--muted); }
.spacer{ height: 20px; }
.divider{ height:1px; background: var(--line); margin: 14px 0; }
.alert{ padding: 12px 14px; border-radius: 10px; background: color-mix(in oklab, var(--brand) 8%, var(--surface)); border:1px solid color-mix(in oklab, var(--brand) 25%, var(--line)); display:flex; gap:10px; align-items:flex-start; font-size:12.5px; color: var(--ink-2); }
.alert.warn{ background: color-mix(in oklab, var(--accent) 12%, var(--surface)); border-color: color-mix(in oklab, var(--accent) 35%, var(--line)); }
`;
window.APP_STYLES = APP_STYLES;
