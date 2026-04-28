'use client';
import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { TopNav } from '@/components/layout/TopNav';
import { useT } from '@/lib/i18n';

interface Props { orderId: string; }

export function SuccessClient({ orderId }: Props) {
  const router = useRouter();
  const qc     = useQueryClient();
  const t      = useT();

  const STATUS_LABEL: Record<string, string> = {
    PENDING:    t('awaitingPayment'),
    PAID:       t('paymentReceived'),
    DELIVERING: t('delivering'),
    DELIVERED:  t('delivered'),
    FAILED:     t('failed'),
    REFUNDED:   t('refunded'),
  };

  const { data: order } = useQuery({
    queryKey: ['order', orderId],
    queryFn:  () => api.order(orderId),
    refetchInterval: (q) => {
      const status = (q.state.data as any)?.status;
      return status === 'DELIVERED' || status === 'FAILED' ? false : 3000;
    },
  });

  const [copied, setCopied] = useState(false);

  // WebSocket — live order updates (works for guests too)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const token = localStorage.getItem('access') ?? undefined;
    let socket: any;
    import('socket.io-client').then(({ io }) => {
      socket = io(`${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'}/ws`, {
        auth: token ? { token } : {},
      });
      socket.emit('subscribe', { orderId });
      socket.on('status', () => qc.invalidateQueries({ queryKey: ['order', orderId] }));
    });
    return () => { socket?.disconnect(); };
  }, [orderId, qc]);

  if (!order) {
    return (
      <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
        <div className="hidden md:block"><TopNav query="" onSearch={() => {}} activeRoute="orders" /></div>
        <div className="m-8 h-48 rounded-2xl animate-pulse" style={{ background: 'var(--surface-2)' }} />
      </div>
    );
  }

  const isCode      = order.method === 'CODE';
  const delivered   = order.status === 'DELIVERED';
  const inProgress  = ['PAID', 'DELIVERING'].includes(order.status);
  const failed      = order.status === 'FAILED';

  const productTitle = order.product?.title ?? 'Order';
  const currency     = order.product?.currencyLabel ?? '';
  const emblem       = order.product?.emblem ?? '?';
  const gradFrom     = order.product?.gradFrom ?? '#1d4ed8';
  const gradTo       = order.product?.gradTo   ?? '#0ea5e9';
  const amount       = order.package?.amount ?? 0;
  const bonus        = order.package?.bonus  ?? 0;

  const paymentMethod = order.payments?.[0]?.method ?? '—';
  const paymentLabel  =
    paymentMethod === 'KHQR' ? 'KHQR' :
    paymentMethod === 'BANK' ? `Bank · ${order.payments?.[0]?.provider?.toUpperCase() ?? ''}` :
    paymentMethod === 'CARD' ? 'Visa / Mastercard' : '—';

  const copyCode = () => {
    if (!order.redeemCode) return;
    navigator.clipboard?.writeText(order.redeemCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  // ── Shared blocks ────────────────────────────────────────────────────────────

  const statusBadge = () => (
    <span
      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[12px] font-semibold"
      style={{
        background:
          failed     ? 'color-mix(in oklab, var(--danger) 12%, var(--surface))'  :
          delivered  ? 'color-mix(in oklab, var(--success) 12%, var(--surface))' :
                       'color-mix(in oklab, var(--brand) 10%, var(--surface))',
        color:
          failed     ? 'var(--danger)'  :
          delivered  ? 'var(--success)' :
                       'var(--brand)',
      }}>
      <span
        className="w-2 h-2 rounded-full"
        style={{
          background: failed ? 'var(--danger)' : delivered ? 'var(--success)' : 'var(--brand)',
          animation:  inProgress ? 'pulse 1.4s infinite' : undefined,
        }} />
      {STATUS_LABEL[order.status] ?? order.status}
    </span>
  );

  const successIcon = () => (
    <div className="relative w-[84px] h-[84px] rounded-full grid place-items-center mx-auto mb-4"
      style={{
        background: failed
          ? 'color-mix(in oklab, var(--danger) 18%, transparent)'
          : 'color-mix(in oklab, var(--success) 18%, transparent)',
        color: failed ? 'var(--danger)' : 'var(--success)',
      }}>
      <span className="text-5xl">{failed ? '✕' : '✓'}</span>
      {!failed && (
        <span className="absolute inset-[-10px] rounded-full border-2"
          style={{
            borderColor: 'color-mix(in oklab, var(--success) 35%, transparent)',
            animation:   'ring 1.6s infinite',
          }} />
      )}
    </div>
  );

  const deliveryPanel = () => (
    <div
      className="mt-5 max-w-[460px] mx-auto rounded-xl p-5 border border-dashed text-center"
      style={{ background: 'var(--surface-2)', borderColor: 'var(--line-strong)' }}>

      {/* Code flow */}
      {isCode && (
        delivered && order.redeemCode ? (
          <>
            <div className="text-[11px] uppercase tracking-widest mb-2" style={{ color: 'var(--muted)' }}>{t('yourRedeemCode')}</div>
            <div className="font-mono text-[20px] md:text-[22px] font-semibold tracking-[3px] mb-3 break-all">{order.redeemCode}</div>
            <button
              onClick={copyCode}
              className="px-4 py-2 rounded-lg border text-[12.5px] font-medium inline-flex items-center gap-1.5 transition-all"
              style={{ background: 'var(--surface)', borderColor: 'var(--line)' }}>
              📋 {copied ? t('copied') : t('copyCode')}
            </button>
            <p className="text-[11.5px] mt-3 mb-0" style={{ color: 'var(--muted)' }}>
              {t('open')} {productTitle} {t('redeemCodeHowTo')}
            </p>
          </>
        ) : failed ? (
          <p className="m-0" style={{ color: 'var(--danger)' }}>{t('codeGenerationFailed')}</p>
        ) : (
          <p className="m-0" style={{ color: 'var(--muted)' }}>
            <span className="inline-block w-2 h-2 rounded-full mr-2" style={{ background: 'var(--brand)', animation: 'pulse 1.4s infinite' }} />
            {t('generatingCode')}
          </p>
        )
      )}

      {/* Direct flow */}
      {!isCode && (
        <>
          <div className="text-[11px] uppercase tracking-widest mb-2" style={{ color: 'var(--muted)' }}>{t('directDelivery')}</div>
          <div className="font-sora text-[18px] md:text-[20px] font-semibold mb-1">
            {amount.toLocaleString()}{bonus ? ` +${bonus}` : ''} {currency}
          </div>
          <div className="text-[12.5px]" style={{ color: 'var(--muted)' }}>
            {t('toId')} <span className="font-mono">{order.gameUserId}</span> {t('zonePrefix')} <span className="font-mono">{order.zoneId}</span>
          </div>
          {inProgress && (
            <div className="flex items-center gap-2 justify-center mt-4 font-medium text-[12.5px]" style={{ color: 'var(--brand)' }}>
              <span className="w-2 h-2 rounded-full" style={{ background: 'var(--brand)', animation: 'pulse 1.4s infinite' }} />
              {t('deliveryInProgress')}
            </div>
          )}
          {delivered && (
            <div className="flex items-center gap-2 justify-center mt-4 font-medium text-[12.5px]" style={{ color: 'var(--success)' }}>
              ✓ {amount.toLocaleString()} {currency} {t('delivered').toLowerCase()}
              {order.deliveredAt && ` ${t('at')} ${new Date(order.deliveredAt).toLocaleTimeString()}`}
            </div>
          )}
          {failed && (
            <div className="mt-4 font-medium text-[12.5px]" style={{ color: 'var(--danger)' }}>
              {t('deliveryFailedRefund')}
            </div>
          )}
        </>
      )}
    </div>
  );

  const receipt = () => (
    <div className="rounded-2xl p-5" style={{ background: 'var(--surface)', border: '1px solid var(--line)', boxShadow: 'var(--shadow-sm)' }}>
      <h4 className="font-sora text-[15px] font-bold m-0 mb-3.5">{t('receipt')}</h4>
      {([
        [t('order'),        order.ref],
        [t('item'),         productTitle],
        [t('packageLabel'), `${amount.toLocaleString()}${bonus ? ` +${bonus}` : ''} ${currency}`],
        [t('method'),       paymentLabel],
        [t('serviceFee'),   `$${(order.feeCents / 100).toFixed(2)}`],
      ] as [string, string][]).map(([k, v]) => (
        <div key={k} className="flex justify-between py-2.5 text-[13px]" style={{ borderBottom: '1px dashed var(--line)' }}>
          <span style={{ color: 'var(--muted)' }}>{k}</span>
          <b className="font-semibold text-right" style={{ marginLeft: 16 }}>{v}</b>
        </div>
      ))}
      <div className="flex items-baseline justify-between pt-4">
        <span className="text-[12px]" style={{ color: 'var(--muted)' }}>{t('paid')}</span>
        <b className="font-sora text-[20px] font-bold">${(order.totalCents / 100).toFixed(2)}</b>
      </div>
      <div className="flex items-center gap-2 mt-4 p-2.5 rounded-xl text-[11.5px]" style={{ background: 'var(--surface-2)', color: 'var(--muted)' }}>
        {t('receiptEmailNotice')}
      </div>
    </div>
  );

  const successHeader = () => (
    <>
      {successIcon()}
      <h2 className="font-sora text-[22px] md:text-[24px] font-bold m-0">
        {failed ? t('paymentFailed') : delivered ? t('allDone') : t('paymentSuccessful')}
      </h2>
      <p className="mt-1.5" style={{ color: 'var(--muted)', fontSize: 13.5 }}>
        Order <span className="font-mono">{order.ref}</span> · {new Date(order.createdAt).toLocaleString()}
      </p>
      <div className="mt-3 flex justify-center">{statusBadge()}</div>
    </>
  );

  // ── Mobile layout ────────────────────────────────────────────────────────────
  const mobileView = () => (
    <div className="min-h-screen relative" style={{ background: 'var(--bg)' }}>
      <div className="h-[200px] relative" style={{
        background: `radial-gradient(140% 110% at 50% 0%, ${gradFrom}, ${gradTo} 70%)`,
      }}>
        <button onClick={() => router.push('/')}
          className="absolute top-3.5 left-3.5 w-10 h-10 rounded-xl grid place-items-center border-0 z-10 text-white"
          style={{ background: 'rgba(0,0,0,.35)', backdropFilter: 'blur(6px)' }}>←</button>
        <div className="absolute inset-x-0 bottom-4 text-center text-white">
          <div className="w-16 h-16 rounded-2xl grid place-items-center font-sora font-extrabold text-[22px] mx-auto mb-2"
            style={{ background: 'rgba(255,255,255,.18)', border: '1px solid rgba(255,255,255,.22)' }}>
            {emblem}
          </div>
          <h1 className="font-sora font-bold text-[18px] m-0">{productTitle}</h1>
        </div>
      </div>

      <div className="route-content -mt-6 relative z-10 px-4 pb-8">
        <div className="rounded-[22px] p-6 text-center"
          style={{ background: 'var(--surface)', border: '1px solid var(--line)', boxShadow: 'var(--shadow-md)' }}>
          {successHeader()}
          {deliveryPanel()}
        </div>

        <div className="mt-4">{receipt()}</div>

        <div className="grid grid-cols-2 gap-3 mt-4">
          <Link href="/account/orders"
            className="h-12 rounded-xl border text-[13.5px] font-semibold no-underline grid place-items-center"
            style={{ background: 'var(--surface)', borderColor: 'var(--line)', color: 'var(--ink)' }}>
            {t('allOrders')}
          </Link>
          <Link href="/"
            className="h-12 rounded-xl text-[13.5px] font-semibold no-underline grid place-items-center text-white"
            style={{ background: 'var(--brand)', boxShadow: '0 8px 16px -4px color-mix(in oklab, var(--brand) 35%, transparent)' }}>
            {t('topUpAgain')}
          </Link>
        </div>
      </div>
    </div>
  );

  // ── Desktop layout ───────────────────────────────────────────────────────────
  const desktopView = () => (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <TopNav query="" onSearch={() => {}} activeRoute="orders" />
      <div className="route-content max-w-[1100px] mx-auto"
        style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 28, padding: '36px 32px', alignItems: 'start' }}>

        <div className="rounded-[22px] p-9 text-center"
          style={{ background: 'var(--surface)', border: '1px solid var(--line)', boxShadow: 'var(--shadow-md)' }}>
          {successHeader()}
          {deliveryPanel()}

          <div className="flex gap-2.5 justify-center mt-6">
            <Link href="/account/orders"
              className="inline-flex items-center px-5 h-[44px] rounded-xl border text-[13.5px] font-semibold no-underline"
              style={{ background: 'var(--surface)', borderColor: 'var(--line)', color: 'var(--ink)' }}>
              {t('viewAllOrders')}
            </Link>
            <Link href={order.product?.slug ? `/p/${order.product.slug}` : '/'}
              className="inline-flex items-center px-5 h-[44px] rounded-xl text-[13.5px] font-semibold no-underline text-white"
              style={{ background: 'var(--brand)', boxShadow: '0 8px 16px -4px color-mix(in oklab, var(--brand) 35%, transparent)' }}>
              {t('topUpAgain')}
            </Link>
          </div>
        </div>

        {receipt()}
      </div>
    </div>
  );

  return (
    <>
      <div className="md:hidden">{mobileView()}</div>
      <div className="hidden md:block">{desktopView()}</div>
    </>
  );
}
