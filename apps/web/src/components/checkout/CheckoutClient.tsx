'use client';
import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { QRCodeSVG } from 'qrcode.react';
import { api } from '@/lib/api';

const BANKS = [
  { id: 'aba',      name: 'ABA Bank',  color: '#1f4eff' },
  { id: 'acleda',   name: 'ACLEDA',    color: '#0f7c4a' },
  { id: 'wing',     name: 'Wing Bank', color: '#19a3ff' },
  { id: 'chipmong', name: 'Chip Mong', color: '#d11f2f' },
];

const PAY_METHODS = [
  { id: 'khqr', label: 'KHQR',             sub: 'Scan with any Cambodian bank app', icon: '⬛' },
  { id: 'bank', label: 'Direct Bank',       sub: 'ABA · ACLEDA · Wing · Chip Mong', icon: '🏦' },
  { id: 'card', label: 'Visa / Mastercard', sub: 'Credit or debit card',             icon: '💳' },
] as const;

interface Props { orderId: string; }

export function CheckoutClient({ orderId }: Props) {
  const router = useRouter();

  const [method,   setMethod]   = useState<'khqr' | 'bank' | 'card'>('khqr');
  const [bank,     setBank]     = useState('aba');
  const [card,     setCard]     = useState({ num: '', name: '', exp: '', cvc: '' });
  const [timer,    setTimer]    = useState(599);
  const [scanning, setScanning] = useState(false);
  const [khqrData, setKhqrData] = useState<{ qrString: string; paymentId: string } | null>(null);

  const { data: order } = useQuery({
    queryKey: ['order', orderId],
    queryFn:  () => api.order(orderId),
  });

  // Auto-initiate KHQR
  const khqrMut = useMutation({
    mutationFn: () => api.initiateKhqr(orderId),
    onSuccess:  d => setKhqrData(d),
  });
  useEffect(() => {
    if (method === 'khqr' && !khqrData && !khqrMut.isPending) khqrMut.mutate();
  }, [method]); // eslint-disable-line

  // Countdown timer
  useEffect(() => {
    if (method !== 'khqr') return;
    const t = setInterval(() => setTimer(s => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [method]);
  const fmtTimer = `${String(Math.floor(timer / 60)).padStart(2, '0')}:${String(timer % 60).padStart(2, '0')}`;

  // WebSocket: navigate on PAID. Works for guests (token is optional).
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const token = localStorage.getItem('access') ?? undefined;
    let socket: any;
    import('socket.io-client').then(({ io }) => {
      socket = io(`${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'}/ws`, {
        auth: token ? { token } : {},
      });
      socket.emit('subscribe', { orderId });
      socket.on('status', (data: any) => {
        if (['PAID', 'DELIVERING', 'DELIVERED'].includes(data.status)) router.push(`/orders/${orderId}`);
      });
    });
    return () => { socket?.disconnect(); };
  }, [orderId, router]);

  const simulate = useMutation({
    mutationFn: () => api.simulateKhqr(orderId),
    onSuccess:  () => router.push(`/orders/${orderId}`),
  });
  const bankMut = useMutation({
    mutationFn: () => api.initiateBank(orderId, bank),
    onSuccess:  d => { window.location.href = d.redirectUrl; },
  });

  const cardOK = card.num.replace(/\s/g, '').length >= 16 && card.exp.length >= 5 && card.cvc.length >= 3 && card.name.length > 2;
  const canPay = method === 'khqr' || method === 'bank' || (method === 'card' && cardOK);

  // Loading state
  if (!order) return (
    <div className="min-h-screen grid place-items-center" style={{ background: 'var(--bg)' }}>
      <div className="w-16 h-16 rounded-full border-4 animate-spin"
        style={{ borderColor: 'var(--brand)', borderTopColor: 'transparent' }} />
    </div>
  );

  const total    = order.totalCents / 100;
  const fee      = order.feeCents / 100;
  const product  = order.product ?? {};

  // ── Inner panels (called as functions — avoids remount flicker) ─────────────

  const khqrPanel = () => (
    <div className="mt-4 p-4 rounded-2xl border border-dashed" style={{ background: 'var(--surface-2)', borderColor: 'var(--line)' }}>
      <div className="flex flex-col md:flex-row gap-5 items-center">
        <div className="w-[190px] h-[190px] bg-white rounded-2xl p-3 border shadow-sm flex-none mx-auto md:mx-0"
          style={{ borderColor: 'var(--line)' }}>
          {khqrData?.qrString
            ? <QRCodeSVG value={khqrData.qrString} size={166} />
            : <div className="w-full h-full grid place-items-center animate-pulse text-sm" style={{ color: 'var(--muted)' }}>Loading…</div>
          }
        </div>
        <div className="text-center md:text-left">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[12px] font-semibold border mb-3"
            style={{ borderColor: 'var(--line)' }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--success)', animation: 'pulse 1.4s infinite' }} />
            Expires {fmtTimer}
          </span>
          <h4 className="font-sora font-bold text-[15px] mb-1">Scan with any KHQR app</h4>
          <p className="text-[12px] mb-3" style={{ color: 'var(--muted)' }}>ABA · ACLEDA · Wing · Chip Mong · TrueMoney &amp; more</p>
          <div className="flex flex-wrap gap-1.5 justify-center md:justify-start mb-3">
            {BANKS.map(b => (
              <span key={b.id} className="px-2.5 py-1 rounded-full text-[11px] font-medium border"
                style={{ background: 'var(--surface)', borderColor: 'var(--line)', color: 'var(--ink-2)' }}>{b.name}</span>
            ))}
          </div>
          <button
            className="px-4 py-2 rounded-xl border text-[12.5px] font-medium transition-all"
            style={{ background: 'var(--surface)', borderColor: 'var(--line)' }}
            onClick={() => { setScanning(true); simulate.mutate(); }}>
            {scanning ? '⏳ Waiting for payment…' : '🧪 Simulate scan'}
          </button>
        </div>
      </div>
    </div>
  );

  const bankPanel = () => (
    <div className="mt-4 p-4 rounded-2xl border border-dashed" style={{ background: 'var(--surface-2)', borderColor: 'var(--line)' }}>
      <h4 className="font-sora font-bold text-[15px] mb-3">Pick your bank</h4>
      <div className="grid grid-cols-2 gap-2.5">
        {BANKS.map(b => (
          <button key={b.id} aria-pressed={bank === b.id} onClick={() => setBank(b.id)}
            className="flex items-center gap-2.5 p-3 rounded-xl border-[1.5px] transition-all duration-150"
            style={{ background: 'var(--surface)', borderColor: bank === b.id ? 'var(--brand)' : 'var(--line)', boxShadow: bank === b.id ? '0 0 0 4px color-mix(in oklab, var(--brand) 10%, transparent)' : undefined }}>
            <div className="w-8 h-8 rounded-lg grid place-items-center text-white text-xs font-bold font-sora flex-none" style={{ background: b.color }}>
              {b.name.split(' ').map((w: string) => w[0]).join('').slice(0, 2)}
            </div>
            <b className="text-[13px]">{b.name}</b>
          </button>
        ))}
      </div>
      <div className="mt-3 p-3 rounded-xl text-[12.5px]"
        style={{ background: 'color-mix(in oklab, var(--brand) 8%, var(--surface))', border: '1px solid color-mix(in oklab, var(--brand) 25%, var(--line))' }}>
        ℹ You'll be redirected to <b>{BANKS.find(b => b.id === bank)?.name}</b> to confirm <b>${total.toFixed(2)}</b>.
      </div>
    </div>
  );

  const cardPanel = () => (
    <div className="mt-4 p-4 rounded-2xl border border-dashed" style={{ background: 'var(--surface-2)', borderColor: 'var(--line)' }}>
      <div className="relative h-[155px] rounded-2xl overflow-hidden p-4 mb-4 text-white"
        style={{ background: 'linear-gradient(135deg, #1a2244, #0b1226 60%)' }}>
        <div className="absolute right-[-30px] top-[-30px] w-36 h-36 rounded-full"
          style={{ background: 'radial-gradient(circle, color-mix(in oklab, var(--brand) 50%, transparent), transparent 70%)' }} />
        <b className="absolute top-4 right-4 font-sora text-[13px] tracking-widest">VISA</b>
        <div className="w-9 h-[26px] rounded-md" style={{ background: 'linear-gradient(135deg,#facc15,#a16207)' }} />
        <div className="font-mono text-[15px] tracking-[2px] mt-4">
          {(card.num || '•••• •••• •••• ••••').padEnd(19, '•').slice(0, 19)}
        </div>
        <div className="flex justify-between mt-3 text-[10px] uppercase tracking-widest" style={{ color: 'rgba(255,255,255,.7)' }}>
          <div><span className="block">Holder</span><b className="text-white text-xs">{card.name || 'YOUR NAME'}</b></div>
          <div><span className="block">Exp</span><b className="text-white text-xs">{card.exp || 'MM/YY'}</b></div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        {[
          { label: 'Card number', col: 'col-span-2', key: 'num',  type: 'text',     ph: '4242 4242 4242 4242', mono: true,
            change: (v: string) => { const n = v.replace(/\D/g,'').slice(0,16); setCard({...card, num: n.replace(/(.{4})/g,'$1 ').trim()}); } },
          { label: 'Cardholder', col: 'col-span-2',  key: 'name', type: 'text',     ph: 'Lina Sok', mono: false,
            change: (v: string) => setCard({...card, name: v.toUpperCase()}) },
          { label: 'Expiry',     col: '',             key: 'exp',  type: 'text',     ph: 'MM/YY', mono: true,
            change: (v: string) => { let n = v.replace(/\D/g,'').slice(0,4); if(n.length>2) n=n.slice(0,2)+'/'+n.slice(2); setCard({...card, exp: n}); } },
          { label: 'CVC',        col: '',             key: 'cvc',  type: 'text',     ph: '123', mono: true,
            change: (v: string) => setCard({...card, cvc: v.replace(/\D/g,'').slice(0,4)}) },
        ].map(f => (
          <div key={f.key} className={f.col}>
            <label className="block text-[11px] font-medium mb-1" style={{ color: 'var(--ink-2)' }}>{f.label}</label>
            <input className={`w-full h-10 px-3 rounded-xl border outline-none text-[13px] ${f.mono ? 'font-mono' : ''}`}
              style={{ background: 'var(--surface)', borderColor: 'var(--line)', color: 'var(--ink)' }}
              placeholder={f.ph} value={(card as any)[f.key]}
              onChange={e => f.change(e.target.value)} />
          </div>
        ))}
      </div>
      <div className="mt-3 p-2.5 rounded-xl text-[11.5px]"
        style={{ background: 'color-mix(in oklab, var(--success) 8%, var(--surface))', border: '1px solid color-mix(in oklab, var(--success) 25%, var(--line))' }}>
        🔒 Secured by 3-D Secure 2.0. Card details never touch our servers.
      </div>
    </div>
  );

  const payBtn = (full = false) => (
    <button disabled={!canPay || scanning || bankMut.isPending}
      onClick={() => {
        if (method === 'bank') bankMut.mutate();
        else if (method === 'khqr') { setScanning(true); simulate.mutate(); }
      }}
      className={`${full ? 'w-full' : 'flex-1 max-w-[220px]'} h-12 rounded-xl font-semibold text-[14px] flex items-center justify-center gap-2 transition-all duration-150`}
      style={{
        background: canPay && !scanning ? 'var(--brand)' : 'var(--surface-2)',
        color:      canPay && !scanning ? '#fff'          : 'var(--muted-2)',
        border:     0,
        boxShadow:  canPay && !scanning ? '0 8px 16px -4px color-mix(in oklab, var(--brand) 35%, transparent)' : 'none',
      }}>
      {method === 'khqr' ? '⬛ I\'ve paid via KHQR'
       : method === 'bank' ? `🏦 Pay with ${BANKS.find(b => b.id === bank)?.name}`
       :                     `🔒 Pay $${total.toFixed(2)}`}
    </button>
  );

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* ── Blurred background: product gradient scene ── */}
      <div className="fixed inset-0" style={{ zIndex: 0 }}>
        <div className="absolute inset-0"
          style={{ background: `radial-gradient(140% 130% at 50% -10%, ${product.gradFrom ?? '#1d4ed8'}, ${product.gradTo ?? '#0ea5e9'} 45%, var(--bg) 72%)` }} />
        {/* Product identity in far background */}
        <div className="absolute top-10 inset-x-0 flex flex-col items-center text-white text-center select-none pointer-events-none"
          style={{ opacity: 0.85 }}>
          <div className="w-20 h-20 rounded-[22px] grid place-items-center font-sora font-extrabold text-[28px] mb-3"
            style={{ background: 'rgba(255,255,255,.15)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,.18)' }}>
            {product.emblem ?? '?'}
          </div>
          <h1 className="font-sora font-bold text-[20px] m-0">{product.title ?? 'Top-up'}</h1>
          <p className="text-[12px] opacity-70 mt-1">
            {order.ref} · ${total.toFixed(2)}
          </p>
        </div>
      </div>

      {/* ── Payment dialog (blur-backdrop) ── */}
      <div
        className="fixed inset-0 flex flex-col justify-end md:justify-center md:items-center p-0 md:p-6"
        style={{ zIndex: 20, backdropFilter: 'blur(16px)', background: 'rgba(8,12,24,.52)' }}
        onClick={e => { if (e.target === e.currentTarget) router.back(); }}>

        <div
          className="relative w-full md:max-w-[560px] rounded-t-[28px] md:rounded-[28px] overflow-hidden flex flex-col"
          style={{
            background:  'var(--surface)',
            maxHeight:   '92vh',
            boxShadow:   '0 -12px 48px rgba(0,0,0,.35), 0 0 0 1px rgba(255,255,255,.06)',
          }}
          onClick={e => e.stopPropagation()}>

          {/* Drag handle (mobile) */}
          <div className="flex justify-center pt-3 pb-1 flex-none md:hidden">
            <div className="w-10 h-1 rounded-full" style={{ background: 'var(--line-strong)' }} />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-5 pt-3 pb-3 flex-none border-b" style={{ borderColor: 'var(--line)' }}>
            <div>
              <h2 className="font-sora font-bold text-[17px] m-0">Choose payment</h2>
              <p className="text-[12px] m-0 mt-0.5" style={{ color: 'var(--muted)' }}>
                {product.title} · <span className="font-mono">{order.ref}</span>
              </p>
            </div>
            <button onClick={() => router.back()}
              className="w-9 h-9 rounded-xl grid place-items-center border text-lg transition-all hover:scale-95 active:scale-90"
              style={{ background: 'var(--surface-2)', borderColor: 'var(--line)', color: 'var(--ink)' }}>
              ✕
            </button>
          </div>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto px-5 py-4" style={{ scrollbarWidth: 'none' }}>
            {/* Method selector */}
            <div className="flex flex-col gap-2.5">
              {PAY_METHODS.map(m => (
                <button key={m.id} aria-pressed={method === m.id} onClick={() => setMethod(m.id)}
                  className="flex items-center gap-3 p-3.5 rounded-xl border-[1.5px] w-full text-left transition-all duration-150"
                  style={{
                    background:  method === m.id ? 'color-mix(in oklab, var(--brand) 5%, var(--surface))' : 'var(--surface)',
                    borderColor: method === m.id ? 'var(--brand)' : 'var(--line)',
                    boxShadow:   method === m.id ? '0 0 0 4px color-mix(in oklab, var(--brand) 10%, transparent)' : undefined,
                  }}>
                  <div className="w-11 h-11 rounded-xl grid place-items-center text-xl flex-none"
                    style={{ background: method === m.id ? 'color-mix(in oklab, var(--brand) 12%, var(--surface-2))' : 'var(--surface-2)' }}>
                    {m.icon}
                  </div>
                  <div className="flex-1">
                    <b className="block text-[13.5px] font-semibold">{m.label}</b>
                    <span className="text-[11.5px]" style={{ color: 'var(--muted)' }}>{m.sub}</span>
                  </div>
                  <div className="w-5 h-5 rounded-full flex-none grid place-items-center"
                    style={{ background: method === m.id ? 'var(--brand)' : undefined, border: method === m.id ? 'none' : '1.5px solid var(--line-strong)' }}>
                    {method === m.id && <span className="text-white text-[10px] font-bold">✓</span>}
                  </div>
                </button>
              ))}
            </div>

            {/* Selected method panel */}
            {method === 'khqr' && khqrPanel()}
            {method === 'bank' && bankPanel()}
            {method === 'card' && cardPanel()}
          </div>

          {/* Sticky footer */}
          <div className="flex-none px-5 py-4 border-t"
            style={{
              background:     'color-mix(in oklab, var(--surface) 96%, transparent)',
              backdropFilter: 'blur(12px)',
              borderColor:    'var(--line)',
            }}>
            <div className="flex items-center justify-between mb-3">
              <div>
                {order.discountCents > 0 && (
                  <p className="text-[11.5px] m-0 mb-0.5" style={{ color: 'var(--success)' }}>
                    🏷 You save ${(order.discountCents / 100).toFixed(2)}
                  </p>
                )}
                <div className="flex items-baseline gap-1.5">
                  <span className="font-sora font-bold text-[22px]">${total.toFixed(2)}</span>
                  <span className="text-[11px]" style={{ color: 'var(--muted)' }}>incl. ${fee.toFixed(2)} fee · USD</span>
                </div>
              </div>
              <div className="text-[11px] text-right" style={{ color: 'var(--muted)' }}>
                🛡 SSL · PCI-DSS<br />Money-back guarantee
              </div>
            </div>
            {payBtn(true)}
          </div>
        </div>
      </div>
    </div>
  );
}
