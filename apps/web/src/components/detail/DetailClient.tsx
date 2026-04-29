'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useQuery, useMutation }                     from '@tanstack/react-query';
import { useRouter }                                 from 'next/navigation';
import { QRCodeSVG }                                 from 'qrcode.react';
import { api }                                       from '@/lib/api';
import { useStore }                                  from '@/lib/store';
import { computeFeeCents }                           from '@topup/shared';
import { TopNav }                                    from '@/components/layout/TopNav';
import { DiamondCluster }                            from './DiamondGem';
import { KhqrDialog }                               from '@/components/checkout/KhqrDialog';
import { useT }                                     from '@/lib/i18n';

interface Props { slug: string; }

const BANKS = [
  { id: 'aba',      name: 'ABA Bank',  color: '#1f4eff' },
  { id: 'acleda',   name: 'ACLEDA',    color: '#0f7c4a' },
  { id: 'wing',     name: 'Wing Bank', color: '#19a3ff' },
  { id: 'chipmong', name: 'Chip Mong', color: '#d11f2f' },
] as const;

const PAY_METHODS = [
  { id: 'khqr', label: 'KHQR',             icon: '⬛', sub: 'Scan with any Cambodian bank app' },
  { id: 'bank', label: 'Direct Bank',       icon: '🏦', sub: 'ABA · ACLEDA · Wing · Chip Mong' },
  { id: 'card', label: 'Visa / Mastercard', icon: '💳', sub: 'Credit or debit card'              },
] as const;

export function DetailClient({ slug }: Props) {
  const router         = useRouter();
  const t              = useT();
  const setCheckout    = useStore(s => s.setCheckout);
  const user           = useStore(s => s.user);
  const pushGuestOrder = useStore(s => s.pushGuestOrder);

  // ── Checkout state ───────────────────────────────────────────────────────
  const [pkg,         setPkg]         = useState<any>(null);
  const [method,      setMethod]      = useState<'direct' | 'code'>('direct');
  const [gameUserId,  setGameUserId]  = useState('');
  const [zoneId,      setZoneId]      = useState('');
  const [accountInfo, setAccountInfo] = useState<{ valid: boolean; displayName: string | null } | null>(null);
  const [validating,  setValidating]  = useState(false);

  // Payment
  const [payMethod, setPayMethod] = useState<'khqr' | 'bank' | 'card'>('khqr');
  const [selBank,   setSelBank]   = useState('aba');
  const [card,      setCard]      = useState({ num: '', name: '', exp: '', cvc: '' });

  // After order created + payment initiated
  const [activeOrder, setActiveOrder] = useState<{
    orderId:    string;
    ref:        string;
    khqrData?:  { qrString: string; expiresAt: string };
  } | null>(null);
  const [showKhqrDialog, setShowKhqrDialog] = useState(false);
  const [scanning,       setScanning]       = useState(false);
  const paymentRef = useRef<HTMLDivElement>(null);

  // ── Product ──────────────────────────────────────────────────────────────
  const { data: product, isLoading } = useQuery({
    queryKey: ['product', slug],
    queryFn:  () => api.product(slug),
  });

  // ── Platform settings (KHQR image, merchant name — public, no auth) ──────
  const { data: platformSettings } = useQuery({
    queryKey:  ['public-settings'],
    queryFn:   api.publicSettings,
    staleTime: 5 * 60_000,
  });
  const merchantKhqrImageUrl = platformSettings?.khqrImageUrl;

  useEffect(() => {
    if (product) setMethod(product.supportsDirect ? 'direct' : 'code');
  }, [product]);

  // ── Validate-account (debounced) ─────────────────────────────────────────
  const debRef = useRef<NodeJS.Timeout>();
  useEffect(() => {
    if (method !== 'direct' || gameUserId.length < 6 || zoneId.length < 3) {
      setAccountInfo(null); setValidating(false); return;
    }
    setAccountInfo(null);
    setValidating(true);
    clearTimeout(debRef.current);
    debRef.current = setTimeout(async () => {
      try { setAccountInfo(await api.validateAccount(slug, { gameUserId, zoneId })); }
      catch { setAccountInfo({ valid: false, displayName: null }); }
      finally { setValidating(false); }
    }, 400);
    return () => clearTimeout(debRef.current);
  }, [gameUserId, zoneId, method, slug]);

  // ── Pricing ──────────────────────────────────────────────────────────────
  const discPct   = product?.discountPercent ?? 0;
  const origSub   = pkg ? pkg.priceCents / 100 : 0;
  const discount  = pkg ? +(origSub * discPct / 100).toFixed(2) : 0;
  const effSub    = +(origSub - discount).toFixed(2);
  const fee       = pkg ? computeFeeCents(Math.round(effSub * 100)) / 100 : 0;
  const total     = +(effSub + fee).toFixed(2);

  const idValid   = method === 'code'
    || (gameUserId.length >= 6 && zoneId.length >= 3 && accountInfo?.valid === true);
  const ready     = !!(pkg && idValid);

  // ── WebSocket (live status update) ───────────────────────────────────────
  useEffect(() => {
    if (!activeOrder?.orderId || typeof window === 'undefined') return;
    const token = localStorage.getItem('access') ?? undefined;
    let socket: any;
    import('socket.io-client').then(({ io }) => {
      socket = io(`${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'}/ws`, {
        auth: token ? { token } : {},
      });
      socket.emit('subscribe', { orderId: activeOrder.orderId });
      socket.on('status', (data: any) => {
        if (['PAID', 'DELIVERING', 'DELIVERED'].includes(data.status))
          router.push(`/orders/${activeOrder.orderId}`);
      });
    });
    return () => { socket?.disconnect(); };
  }, [activeOrder?.orderId, router]);

  // ── Pay: create order + initiate payment in one click ───────────────────
  const payMut = useMutation({
    mutationFn: async () => {
      const order = await api.createOrder(
        {
          productId:  product.id,
          packageId:  pkg.id,
          method:     method === 'direct' ? 'DIRECT' : 'CODE',
          gameUserId: method === 'direct' ? gameUserId : undefined,
          zoneId:     method === 'direct' ? zoneId     : undefined,
        },
        crypto.randomUUID(),
      );
      const orderId = order.id;
      if (!user) pushGuestOrder(orderId);
      setCheckout({ orderId, productId: product.id, packageId: pkg.id,
        topupMethod: method === 'direct' ? 'DIRECT' : 'CODE', gameUserId, zoneId });

      if (payMethod === 'khqr') {
        const qr = await api.initiateKhqr(orderId);
        setActiveOrder({ orderId, ref: order.ref, khqrData: qr });
        setScanning(false);
        setShowKhqrDialog(true);   // ← open the KHQR dialog
      } else if (payMethod === 'bank') {
        const b = await api.initiateBank(orderId, selBank);
        setActiveOrder({ orderId, ref: order.ref });
        window.location.href = b.redirectUrl;
      } else {
        await api.initiateCard(orderId);
        setActiveOrder({ orderId, ref: order.ref });
        router.push(`/orders/${orderId}`);
      }
    },
    onError: (e: any) => {
      if (!String(e?.message ?? '').includes('Session expired'))
        alert(`Payment error: ${e?.message ?? 'Unknown error'}`);
    },
  });

  const simulateMut = useMutation({
    mutationFn: () => api.simulateKhqr(activeOrder!.orderId),
    onSuccess:  () => router.push(`/orders/${activeOrder!.orderId}`),
  });

  if (isLoading || !product) return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <div className="hidden md:block"><TopNav query="" onSearch={() => {}} activeRoute="detail"/></div>
      <div className="animate-pulse m-6 h-48 rounded-2xl" style={{ background: 'var(--surface-2)' }}/>
    </div>
  );

  const bannerBg = `radial-gradient(140% 110% at 20% 20%, ${product.gradFrom}, ${product.gradTo} 55%, color-mix(in oklab, ${product.gradTo} 50%, #000))`;

  // ── Package card ──────────────────────────────────────────────────────────
  const packageCard = (p: any) => {
    const sel        = pkg?.id === p.id;
    const orig       = p.priceCents / 100;
    const after      = +(orig * (1 - discPct / 100)).toFixed(2);

    return (
      <button key={p.id} aria-pressed={sel} onClick={() => setPkg(sel ? null : p)}
        className="tap-bounce-sm relative flex flex-col items-center pt-3 pb-2.5 px-2 rounded-2xl border-[1.5px] text-center hover:-translate-y-0.5"
        style={{
          background:  sel ? 'color-mix(in oklab, var(--brand) 7%, var(--surface))' : 'var(--surface)',
          borderColor: sel ? 'var(--brand)'  : 'var(--line)',
          boxShadow:   sel ? '0 0 0 3px color-mix(in oklab, var(--brand) 14%, transparent), var(--shadow-sm)' : 'var(--shadow-sm)',
        }}>

        {/* Popular / Best tag */}
        {(p.popular || p.best) && (
          <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase text-white whitespace-nowrap"
            style={{ background: p.best ? 'var(--brand)' : 'var(--accent)' }}>
            {p.best ? t('best') : t('popular')}
          </span>
        )}

        {/* Diamond cluster */}
        <div className="flex items-center justify-center" style={{ height: 46, marginTop: p.popular || p.best ? 6 : 0 }}>
          <DiamondCluster
            amount={p.amount}
            currency={product.currencyLabel}
            currencyImageUrl={product.currencyImageUrl}
            size="sm"
          />
        </div>

        {/* Amount */}
        <div className="font-sora font-extrabold mt-1.5 leading-none"
          style={{ fontSize: 14, color: sel ? 'var(--brand)' : 'var(--ink)' }}>
          {p.amount.toLocaleString()}
        </div>

        {/* Bonus */}
        <div className="h-3.5 mt-0.5">
          {p.bonus > 0 && (
            <span className="text-[9px] font-semibold" style={{ color: 'var(--success)' }}>+{p.bonus}</span>
          )}
        </div>

        {/* Price row */}
        <div className="mt-1.5 pt-1.5 w-full" style={{ borderTop: '1px dashed var(--line)' }}>
          {discPct > 0 ? (
            <div className="flex flex-col items-center gap-0">
              <s className="text-[9px]" style={{ color: 'var(--muted-2)' }}>${orig.toFixed(2)}</s>
              <b className="text-[11.5px] font-bold leading-tight" style={{ color: 'var(--success)' }}>${after}</b>
            </div>
          ) : (
            <b className="text-[12px] font-bold">${orig.toFixed(2)}</b>
          )}
        </div>

        {/* Selection check mark */}
        {sel && (
          <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full grid place-items-center"
            style={{ background: 'var(--brand)' }}>
            <span className="text-white text-[9px] font-bold">✓</span>
          </div>
        )}
      </button>
    );
  };

  // ── Payment section (inline, no popup) ───────────────────────────────────
  const paymentSection = () => (
    <div ref={paymentRef}>
      <div className="flex items-center gap-2 mb-3">
        <h3 className="font-sora font-bold text-[14px] m-0">{t('paymentMethod')}</h3>
        {!ready && <span className="text-[10.5px] px-2 py-0.5 rounded-full"
          style={{ background: 'var(--surface-2)', color: 'var(--muted)' }}>{t('selectPackageAbove')}</span>}
      </div>

      {/* Method tabs */}
      <div className="flex flex-col gap-2">
        {PAY_METHODS.map(m => (
          <button key={m.id} aria-pressed={payMethod === m.id} disabled={!ready}
            onClick={() => setPayMethod(m.id)}
            className="flex items-center gap-3 p-3 rounded-xl border-[1.5px] w-full text-left transition-all duration-150"
            style={{
              background:  payMethod === m.id ? 'color-mix(in oklab, var(--brand) 6%, var(--surface))' : 'var(--surface)',
              borderColor: payMethod === m.id ? 'var(--brand)' : 'var(--line)',
              boxShadow:   payMethod === m.id ? '0 0 0 3px color-mix(in oklab, var(--brand) 10%, transparent)' : undefined,
              opacity:     !ready ? 0.5 : 1,
            }}>
            <div className="w-10 h-10 rounded-xl grid place-items-center text-xl flex-none"
              style={{ background: payMethod === m.id ? 'color-mix(in oklab, var(--brand) 12%, var(--surface-2))' : 'var(--surface-2)' }}>
              {m.icon}
            </div>
            <div className="flex-1 min-w-0">
              <b className="block text-[13px] font-semibold">{m.label}</b>
              <span className="text-[11px]" style={{ color: 'var(--muted)' }}>{m.sub}</span>
            </div>
            <div className="w-4 h-4 rounded-full flex-none grid place-items-center"
              style={{ background: payMethod === m.id ? 'var(--brand)' : undefined, border: payMethod === m.id ? 'none' : '1.5px solid var(--line-strong)' }}>
              {payMethod === m.id && <span className="text-white text-[9px] font-bold">✓</span>}
            </div>
          </button>
        ))}
      </div>

      {/* Bank picker */}
      {payMethod === 'bank' && ready && (
        <div className="mt-3 grid grid-cols-2 gap-2">
          {BANKS.map(b => (
            <button key={b.id} aria-pressed={selBank === b.id} onClick={() => setSelBank(b.id)}
              className="flex items-center gap-2 p-2.5 rounded-xl border-[1.5px] transition-all"
              style={{ background: 'var(--surface)', borderColor: selBank === b.id ? 'var(--brand)' : 'var(--line)', boxShadow: selBank === b.id ? '0 0 0 3px color-mix(in oklab, var(--brand) 10%, transparent)' : undefined }}>
              <div className="w-7 h-7 rounded-lg grid place-items-center text-white text-[10px] font-bold font-sora flex-none" style={{ background: b.color }}>
                {b.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
              </div>
              <span className="text-[12px] font-semibold">{b.name}</span>
            </button>
          ))}
        </div>
      )}

      {/* Card form */}
      {payMethod === 'card' && ready && (
        <div className="mt-3 p-3.5 rounded-2xl border border-dashed" style={{ background: 'var(--surface-2)', borderColor: 'var(--line)' }}>
          <div className="relative h-[130px] rounded-2xl overflow-hidden p-3.5 mb-3 text-white"
            style={{ background: 'linear-gradient(135deg, #1a2244, #0b1226 60%)' }}>
            <div className="absolute right-[-20px] top-[-20px] w-28 h-28 rounded-full"
              style={{ background: 'radial-gradient(circle, color-mix(in oklab, var(--brand) 50%, transparent), transparent 70%)' }} />
            <b className="absolute top-3 right-3.5 font-sora text-[12px] tracking-widest">VISA</b>
            <div className="w-7 h-5 rounded" style={{ background: 'linear-gradient(135deg,#facc15,#a16207)' }} />
            <div className="font-mono text-[13px] tracking-widest mt-3">
              {(card.num || '•••• •••• •••• ••••').padEnd(19, '•').slice(0, 19)}
            </div>
            <div className="flex justify-between mt-2 text-[10px] uppercase" style={{ color: 'rgba(255,255,255,.65)' }}>
              <div><span className="block">Holder</span><b className="text-white">{card.name || 'YOUR NAME'}</b></div>
              <div><span className="block">Exp</span><b className="text-white">{card.exp || 'MM/YY'}</b></div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {([
              { label:'Card number', span:'col-span-2', key:'num',  ph:'4242 4242 4242 4242', mono:true,  fn:(v:string)=>{const n=v.replace(/\D/g,'').slice(0,16);setCard(c=>({...c,num:n.replace(/(.{4})/g,'$1 ').trim()}));}},
              { label:'Cardholder',  span:'col-span-2', key:'name', ph:'Lina Sok',            mono:false, fn:(v:string)=>setCard(c=>({...c,name:v.toUpperCase()}))},
              { label:'Expiry',      span:'',           key:'exp',  ph:'MM/YY',               mono:true,  fn:(v:string)=>{let n=v.replace(/\D/g,'').slice(0,4);if(n.length>2)n=n.slice(0,2)+'/'+n.slice(2);setCard(c=>({...c,exp:n}));}},
              { label:'CVC',         span:'',           key:'cvc',  ph:'123',                 mono:true,  fn:(v:string)=>setCard(c=>({...c,cvc:v.replace(/\D/g,'').slice(0,4)}))},
            ] as any[]).map(f => (
              <div key={f.key} className={f.span}>
                <label className="block text-[10.5px] font-medium mb-1" style={{ color:'var(--ink-2)' }}>{f.label}</label>
                <input className={`w-full h-9 px-2.5 rounded-xl border outline-none text-[12.5px] ${f.mono?'font-mono':''}`}
                  style={{ background:'var(--surface)', borderColor:'var(--line)', color:'var(--ink)' }}
                  placeholder={f.ph} value={(card as any)[f.key]}
                  onChange={e=>f.fn(e.target.value)}/>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* KHQR status line — shown after payment initiated, before/after dialog */}
      {activeOrder?.khqrData && !showKhqrDialog && (
        <button
          onClick={() => setShowKhqrDialog(true)}
          className="mt-4 w-full flex items-center justify-between p-3.5 rounded-2xl border-2 transition-all hover:opacity-90"
          style={{ background:'color-mix(in oklab, var(--success) 8%, var(--surface))', borderColor:'color-mix(in oklab, var(--success) 40%, var(--line))' }}>
          <div className="flex items-center gap-2 text-[13px] font-semibold">
            <span className="w-2 h-2 rounded-full" style={{ background:'var(--success)', animation:'pulse 1.4s infinite' }}/>
            {t('khqrReadyTap')}
          </div>
          <span className="text-[13px]" style={{ color:'var(--muted)' }}>→</span>
        </button>
      )}
    </div>
  );

  // ── Mobile layout ─────────────────────────────────────────────────────────
  const mobileView = () => (
    <div className="flex flex-col min-h-screen" style={{ background:'var(--bg)' }}>
      {/* Banner */}
      <div className="relative h-[190px] flex flex-col justify-end p-4 text-white flex-none overflow-hidden"
        style={{ background: bannerBg }}>
        {product.imageUrl && (
          <img src={product.imageUrl} alt={product.title}
            className="absolute inset-0 w-full h-full object-cover"
            onError={e=>{ (e.target as HTMLImageElement).style.display='none'; }}/>
        )}
        <div className="absolute inset-0" style={{ background:'linear-gradient(180deg,rgba(0,0,0,.1),rgba(0,0,0,.6))' }}/>
        <button onClick={()=>router.back()}
          className="absolute top-3.5 left-3.5 w-10 h-10 rounded-xl grid place-items-center border-0 z-10"
          style={{ background:'rgba(0,0,0,.35)', backdropFilter:'blur(6px)', color:'#fff' }}>←</button>
        <div className="relative z-10">
          <div className="w-12 h-12 rounded-xl overflow-hidden flex items-center justify-center font-sora font-extrabold text-lg mb-2"
            style={{ background:'rgba(255,255,255,.15)', border:'1px solid rgba(255,255,255,.2)' }}>
            {product.imageUrl ? <img src={product.imageUrl} alt="" className="w-full h-full object-cover"/> : product.emblem}
          </div>
          <h1 className="font-sora font-bold text-[19px] m-0">{product.title}</h1>
        </div>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth:'none', paddingBottom:90 }}>
        <div className="p-4 flex flex-col gap-4">

          {/* Method toggle */}
          <div className="grid grid-cols-2 gap-2">
            {(['direct','code'] as const).map(m => {
              const dis = m==='direct' ? !product.supportsDirect : !product.supportsCode;
              return (
                <button key={m} disabled={dis} aria-pressed={method===m} onClick={()=>setMethod(m)}
                  className="tap-bounce-sm relative p-3 rounded-xl border-[1.5px] text-left"
                  style={{ background:method===m?'color-mix(in oklab, var(--brand) 5%, var(--surface))':'var(--surface)', borderColor:method===m?'var(--brand)':'var(--line)', opacity:dis?.4:1 }}>
                  <span className="absolute top-2.5 right-2.5 w-4 h-4 rounded-full border grid place-items-center text-[9px]"
                    style={{ background:method===m?'var(--brand)':undefined, borderColor:method===m?'var(--brand)':'var(--line-strong)', color:method===m?'#fff':undefined }}>
                    {method===m?'✓':''}
                  </span>
                  <h4 className="font-sora text-[12px] font-bold m-0 mb-0.5 pr-5">{m==='direct'?t('directTopup'):t('getACode')}</h4>
                  <p className="text-[10px] m-0" style={{ color:'var(--muted)' }}>{m==='direct'?t('directTopupSub'):t('redeemInGame')}</p>
                </button>
              );
            })}
          </div>

          {/* ID fields */}
          {method==='direct' && (
            <div>
              <div className="grid gap-2" style={{ gridTemplateColumns:'1fr 90px' }}>
                <div>
                  <label className="block text-[10.5px] font-medium mb-1" style={{ color:'var(--ink-2)' }}>{t('gameUserId')}</label>
                  <div className="relative">
                    <input className="w-full h-10 px-3 rounded-xl border outline-none text-[13px]"
                      style={{ background:'var(--surface)', borderColor:gameUserId&&gameUserId.length<6?'var(--danger)':'var(--line)', color:'var(--ink)' }}
                      placeholder="312789045" value={gameUserId}
                      onChange={e=>setGameUserId(e.target.value.replace(/\D/g,''))}/>
                    {gameUserId.length>=6&&<span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px]" style={{ color:'var(--success)' }}>✓</span>}
                  </div>
                </div>
                <div>
                  <label className="block text-[10.5px] font-medium mb-1" style={{ color:'var(--ink-2)' }}>{t('zoneLabel')}</label>
                  <div className="relative">
                    <input className="w-full h-10 px-3 rounded-xl border outline-none text-[13px]"
                      style={{ background:'var(--surface)', borderColor:'var(--line)', color:'var(--ink)' }}
                      placeholder="2155" value={zoneId}
                      onChange={e=>setZoneId(e.target.value.replace(/\D/g,''))}/>
                    {zoneId.length>=3&&<span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px]" style={{ color:'var(--success)' }}>✓</span>}
                  </div>
                </div>
              </div>
              {validating && (
                <div className="flex items-center gap-2 mt-2 p-2.5 rounded-xl text-[11.5px]"
                  style={{ background:'var(--surface-2)', color:'var(--muted)' }}>
                  <span className="w-3 h-3 rounded-full inline-block" style={{ background:'var(--brand)', animation:'pulse 1.2s infinite' }}/> {t('verifying')}
                </div>
              )}
              {!validating && accountInfo?.valid && (
                <div className="flex items-center gap-2 mt-2 p-2.5 rounded-xl text-[11.5px]"
                  style={{ background:'color-mix(in oklab, var(--success) 8%, var(--surface))', border:'1px solid color-mix(in oklab, var(--success) 25%, var(--line))' }}>
                  <span style={{ color:'var(--success)' }}>✓</span> {t('verified')} <b>{accountInfo.displayName}</b>
                </div>
              )}
              {!validating && accountInfo && !accountInfo.valid && (
                <div className="flex items-center gap-2 mt-2 p-2.5 rounded-xl text-[11.5px]"
                  style={{ background:'color-mix(in oklab, var(--danger) 8%, var(--surface))', border:'1px solid color-mix(in oklab, var(--danger) 25%, var(--line))', color:'var(--danger)' }}>
                  <span>✕</span> {t('accountNotFound')}
                </div>
              )}
            </div>
          )}
          {method==='code' && (
            <div className="flex items-start gap-2 p-3 rounded-xl text-[11.5px]"
              style={{ background:'color-mix(in oklab, var(--brand) 8%, var(--surface))', border:'1px solid color-mix(in oklab, var(--brand) 25%, var(--line))' }}>
              {t('codeDeliveryNotice')}
            </div>
          )}

          {/* Package grid — 3 columns, compact */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <h3 className="font-sora font-bold text-[14px] m-0">{t('choose')} {product.currencyLabel}</h3>
              {discPct>0&&<span className="px-2 py-0.5 rounded-full text-[10.5px] font-bold" style={{ background:'#dcfce7', color:'#15803d' }}>{discPct}% OFF</span>}
            </div>
            <div className="grid grid-cols-3 gap-2">
              {(product.packages??[]).map((p:any)=>packageCard(p))}
            </div>
          </div>

          {/* Inline payment */}
          {paymentSection()}
        </div>
      </div>

      {/* Sticky bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 flex items-center justify-between gap-3 px-4 py-3"
        style={{ background:'color-mix(in oklab, var(--surface) 95%, transparent)', backdropFilter:'blur(16px)', borderTop:'1px solid var(--line)', zIndex:40 }}>
        <div>
          {discount>0&&<div className="text-[10px] font-semibold" style={{ color:'var(--success)' }}>Saved ${discount.toFixed(2)}</div>}
          <b className="font-sora text-[18px] font-bold">{ready?`$${total.toFixed(2)}`:'—'}</b>
          {ready&&<span className="text-[10px] ml-1" style={{ color:'var(--muted)' }}>+ fee ${fee.toFixed(2)}</span>}
        </div>
        <button
          disabled={!ready||payMut.isPending}
          onClick={()=>payMut.mutate()}
          className={`flex-1 max-w-[200px] h-12 rounded-xl font-semibold text-[13.5px] flex items-center justify-center gap-1.5 transition-all${payMut.isPending?' btn-busy':''}`}
          style={{ background:ready?'var(--brand)':'var(--surface-2)', color:ready?'#fff':'var(--muted-2)', border:0, boxShadow:ready?'0 8px 20px -4px color-mix(in oklab, var(--brand) 40%, transparent)':'none' }}>
          {payMut.isPending?t('processing'):payMethod==='khqr'?t('payWithKhqr'):payMethod==='bank'?t('payWithBank'):t('payNow')}
        </button>
      </div>
    </div>
  );

  // ── Desktop layout ────────────────────────────────────────────────────────
  const desktopView = () => (
    <div className="min-h-screen" style={{ background:'var(--bg)' }}>
      <TopNav query="" onSearch={()=>{}} activeRoute="detail"/>
      <div className="route-content max-w-[1200px] mx-auto"
        style={{ display:'grid', gridTemplateColumns:'1fr 360px', gap:28, padding:'24px 32px', alignItems:'start' }}>

        <div>
          {/* Banner */}
          <div className="relative rounded-[22px] overflow-hidden p-7 flex gap-5 items-center min-h-[155px] text-white"
            style={{ background:bannerBg }}>
            {product.imageUrl&&(
              <img src={product.imageUrl} alt={product.title}
                className="absolute inset-0 w-full h-full object-cover"
                onError={e=>{(e.target as HTMLImageElement).style.display='none';}}/>
            )}
            <div className="absolute inset-0 rounded-[22px]"
              style={{ background:product.imageUrl?'rgba(0,0,0,.42)':'linear-gradient(135deg,rgba(0,0,0,0),rgba(0,0,0,.3))' }}/>
            <div className="relative w-24 h-24 rounded-[20px] overflow-hidden flex items-center justify-center font-sora font-extrabold text-4xl"
              style={{ background:'rgba(255,255,255,.12)', border:'1px solid rgba(255,255,255,.18)', backdropFilter:'blur(10px)', zIndex:1 }}>
              {product.imageUrl?<img src={product.imageUrl} alt="" className="w-full h-full object-cover"/>:product.emblem}
            </div>
            <div style={{ position:'relative', zIndex:1 }}>
              <h1 className="font-sora text-[26px] font-bold m-0">{product.title}</h1>
              <p className="mt-1 opacity-80 text-[13px]">{product.sub} · Top up {product.currencyLabel}</p>
              <div className="flex gap-2 mt-2">
                {['⚡ Instant','🛡 Official','4.9 ★'].map(t=>(
                  <span key={t} className="px-2.5 py-1 rounded-full text-[11px]"
                    style={{ background:'rgba(255,255,255,.15)', border:'1px solid rgba(255,255,255,.18)' }}>{t}</span>
                ))}
                {product.vip&&<span className="px-2.5 py-1 rounded-full text-[11px] font-bold" style={{ background:'#fbbf24', color:'#fff' }}>VIP</span>}
              </div>
            </div>
          </div>

          {/* Method toggle */}
          <div className="grid grid-cols-2 gap-3 my-5">
            {(['direct','code'] as const).map(m => {
              const dis=m==='direct'?!product.supportsDirect:!product.supportsCode;
              return (
                <button key={m} disabled={dis} aria-pressed={method===m} onClick={()=>setMethod(m)}
                  className="relative p-4 rounded-xl border-[1.5px] text-left transition-all"
                  style={{ background:method===m?'color-mix(in oklab, var(--brand) 5%, var(--surface))':'var(--surface)', borderColor:method===m?'var(--brand)':'var(--line)', boxShadow:method===m?'0 0 0 4px color-mix(in oklab, var(--brand) 12%, transparent)':undefined, opacity:dis?.4:1 }}>
                  <span className="absolute top-3 right-3 w-[22px] h-[22px] rounded-full border grid place-items-center text-[10px]"
                    style={{ background:method===m?'var(--brand)':undefined, borderColor:method===m?'var(--brand)':'var(--line-strong)', color:method===m?'#fff':undefined }}>
                    {method===m?'✓':''}
                  </span>
                  <h4 className="font-sora text-[13.5px] font-bold m-0 mb-1">{m==='direct'?t('directTopup'):t('getACode')}</h4>
                  <p className="text-[11.5px] m-0" style={{ color:'var(--muted)' }}>
                    {m==='direct'?t('diamondsDirectInfo'):t('codeDeliveryInfo')}
                  </p>
                </button>
              );
            })}
          </div>

          {/* ID fields */}
          {method==='direct'&&(
            <div className="mb-5">
              <div className="grid gap-3" style={{ gridTemplateColumns:'1fr 130px' }}>
                <div>
                  <label className="block text-[12px] font-medium mb-1.5" style={{ color:'var(--ink-2)' }}>{t('gameUserId')}</label>
                  <div className="relative">
                    <input className="w-full h-11 px-3.5 rounded-xl border outline-none text-[14px]"
                      style={{ background:'var(--surface)', borderColor:gameUserId&&gameUserId.length<6?'var(--danger)':'var(--line)', color:'var(--ink)' }}
                      placeholder="e.g. 312789045" value={gameUserId}
                      onChange={e=>setGameUserId(e.target.value.replace(/\D/g,''))}/>
                    {gameUserId.length>=6&&<span className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color:'var(--success)' }}>✓</span>}
                  </div>
                  <span className="text-[11px] mt-1 block" style={{ color:'var(--muted)' }}>{t('gameUserIdHint')}</span>
                </div>
                <div>
                  <label className="block text-[12px] font-medium mb-1.5" style={{ color:'var(--ink-2)' }}>{t('zoneIdLabel')}</label>
                  <div className="relative">
                    <input className="w-full h-11 px-3.5 rounded-xl border outline-none text-[14px]"
                      style={{ background:'var(--surface)', borderColor:'var(--line)', color:'var(--ink)' }}
                      placeholder="2155" value={zoneId}
                      onChange={e=>setZoneId(e.target.value.replace(/\D/g,''))}/>
                    {zoneId.length>=3&&<span className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color:'var(--success)' }}>✓</span>}
                  </div>
                </div>
              </div>
              {validating&&(
                <div className="flex items-center gap-2 mt-2.5 p-3 rounded-xl text-[12.5px]"
                  style={{ background:'var(--surface-2)', color:'var(--muted)' }}>
                  <span className="w-3 h-3 rounded-full inline-block" style={{ background:'var(--brand)', animation:'pulse 1.2s infinite' }}/> {t('verifying')}
                </div>
              )}
              {!validating&&accountInfo?.valid&&(
                <div className="flex items-center gap-2 mt-2.5 p-3 rounded-xl text-[12.5px]"
                  style={{ background:'color-mix(in oklab, var(--success) 8%, var(--surface))', border:'1px solid color-mix(in oklab, var(--success) 30%, var(--line))' }}>
                  <span style={{ color:'var(--success)' }}>✓</span> {t('verified')} <b>{accountInfo.displayName}</b> — {product.title}, {t('zoneLabel')} {zoneId}
                </div>
              )}
              {!validating&&accountInfo&&!accountInfo.valid&&(
                <div className="flex items-center gap-2 mt-2.5 p-3 rounded-xl text-[12.5px]"
                  style={{ background:'color-mix(in oklab, var(--danger) 8%, var(--surface))', border:'1px solid color-mix(in oklab, var(--danger) 30%, var(--line))', color:'var(--danger)' }}>
                  <span>✕</span> {t('accountNotFound')}
                </div>
              )}
            </div>
          )}
          {method==='code'&&(
            <div className="flex items-start gap-2 p-3 rounded-xl text-[12.5px] mb-5"
              style={{ background:'color-mix(in oklab, var(--brand) 8%, var(--surface))', border:'1px solid color-mix(in oklab, var(--brand) 25%, var(--line))' }}>
              ℹ A one-time redeem code will be sent after payment.
            </div>
          )}

          {/* Package grid — 4-col compact diamond cards */}
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-sora font-bold text-[16px] m-0">{t('choose')} {product.currencyLabel}</h3>
            {discPct>0&&<span className="px-2.5 py-1 rounded-full text-[12px] font-bold" style={{ background:'#dcfce7', color:'#15803d' }}>🏷 {discPct}% OFF all</span>}
          </div>
          <div className="grid gap-2.5" style={{ gridTemplateColumns:'repeat(auto-fill, minmax(110px, 1fr))' }}>
            {(product.packages??[]).map((p:any)=>packageCard(p))}
          </div>
        </div>

        {/* Right sticky: summary + inline payment */}
        <aside className="sticky flex flex-col gap-3" style={{ top:80 }}>

          {/* Order summary */}
          <div className="rounded-2xl p-4"
            style={{ background:'var(--surface)', border:'1px solid var(--line)', boxShadow:'var(--shadow-sm)' }}>
            <h4 className="font-sora font-bold text-[14px] m-0 mb-3">Order summary</h4>
            {[
              ['Game',         product.title],
              ['Currency',     product.currencyLabel],
              [t('method'),     method==='direct'?t('directTopup'):t('voucherCode')],
              ...(method==='direct'&&gameUserId?[[t('account'),`${gameUserId} · ${t('zoneLabel')} ${zoneId||'—'}`]]:[] as any),
              ...(method==='direct'&&accountInfo?.valid&&accountInfo.displayName?[[t('username'),accountInfo.displayName]]:[] as any),
              ['Package',      pkg?`${pkg.amount.toLocaleString()}${pkg.bonus?` +${pkg.bonus}`:''} ${product.currencyLabel}`:'—'],
              ...(discount>0?[['Discount',`-$${discount.toFixed(2)}`]]:[] as any),
              ['Service fee',  `$${fee.toFixed(2)}`],
            ].map(([k,v])=>(
              <div key={k} className="flex justify-between py-1.5 text-[12.5px]" style={{ borderBottom:'1px dashed var(--line)' }}>
                <span style={{ color:'var(--muted)' }}>{k}</span>
                <b className="font-semibold" style={{ color:k==='Discount'?'var(--success)':undefined }}>{v}</b>
              </div>
            ))}
            <div className="flex items-baseline justify-between mt-3">
              <span className="text-[11px]" style={{ color:'var(--muted)' }}>Total to pay</span>
              <div className="font-sora font-bold text-[22px]">
                ${ready?total.toFixed(2):'0.00'}<small className="text-[11px] font-normal ml-1" style={{ color:'var(--muted)' }}>USD</small>
              </div>
            </div>
          </div>

          {/* Inline payment */}
          <div className="rounded-2xl p-4"
            style={{ background:'var(--surface)', border:'1px solid var(--line)', boxShadow:'var(--shadow-sm)' }}>
            {paymentSection()}
            <button
              disabled={!ready||payMut.isPending}
              onClick={()=>payMut.mutate()}
              className={`w-full h-12 rounded-xl font-semibold text-[14.5px] flex items-center justify-center gap-2 mt-4 transition-all${payMut.isPending?' btn-busy':''}`}
              style={{ background:ready?'var(--brand)':'var(--surface-2)', color:ready?'#fff':'var(--muted-2)', border:0, boxShadow:ready?'0 8px 20px -4px color-mix(in oklab, var(--brand) 40%, transparent)':'none' }}>
              {payMut.isPending?t('processing'):payMethod==='khqr'?t('payWithKhqr'):payMethod==='bank'?`${t('continueToBank')} ${BANKS.find(b=>b.id===selBank)?.name}`:`${t('payWithCard')} $${ready?total.toFixed(2):'—'}`}
            </button>
            <div className="flex items-center gap-2 mt-3 p-2.5 rounded-xl text-[11px]"
              style={{ background:'var(--surface-2)', color:'var(--muted)' }}>
              {t('safeBadge')}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );

  return (
    <>
      <div className="md:hidden">{mobileView()}</div>
      <div className="hidden md:block">{desktopView()}</div>

      {/* KHQR dialog — fixed overlay on top of detail page with backdrop blur */}
      {showKhqrDialog && activeOrder?.khqrData && (
        <KhqrDialog
          imageUrl={merchantKhqrImageUrl}
          qrString={activeOrder.khqrData.qrString}
          merchantName={platformSettings?.khqrMerchantName}
          total={total}
          orderRef={activeOrder.ref}
          scanning={scanning}
          onSimulate={() => { setScanning(true); simulateMut.mutate(); }}
          onClose={() => setShowKhqrDialog(false)}
        />
      )}
    </>
  );
}
