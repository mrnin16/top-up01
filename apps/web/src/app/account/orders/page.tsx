'use client';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { api } from '@/lib/api';
import { TopNav } from '@/components/layout/TopNav';
import { useT } from '@/lib/i18n';

export default function OrdersPage() {
  const router = useRouter();
  const user   = useStore(s => s.user);
  const t      = useT();

  const STATUS_STYLE: Record<string, { bg: string; color: string; label: string }> = {
    PENDING:    { bg: 'var(--surface-2)', color: 'var(--muted)',  label: t('awaitingPayment') },
    PAID:       { bg: '#e7eeff',          color: 'var(--brand)',  label: t('paid')            },
    DELIVERING: { bg: '#fff7ed',          color: '#c2410c',       label: t('delivering')      },
    DELIVERED:  { bg: '#dcfce7',          color: '#15803d',       label: t('delivered')       },
    FAILED:     { bg: '#fee2e2',          color: 'var(--danger)', label: t('failed')          },
    REFUNDED:   { bg: 'var(--surface-2)', color: 'var(--muted)',  label: t('refunded')        },
  };

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['my-orders'],
    queryFn:  () => api.orders(),
    enabled:  !!user,
  });

  if (!user) {
    return (
      <div className="min-h-screen grid place-items-center" style={{ background: 'var(--bg)' }}>
        <p style={{ color: 'var(--muted)' }}>
          {t('please')} <Link href="/auth/login?next=/account/orders" style={{ color: 'var(--brand)' }}>{t('signIn').toLowerCase()}</Link> {t('toViewOrders')}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <div className="hidden md:block">
        <TopNav query="" onSearch={() => {}} activeRoute="orders" />
      </div>

      <div className="max-w-3xl mx-auto px-4 md:px-6 py-6 md:py-8 route-content">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => router.back()}
            className="w-9 h-9 rounded-xl border grid place-items-center text-lg"
            style={{ background: 'var(--surface)', borderColor: 'var(--line)' }}>←</button>
          <h1 className="font-sora font-bold text-xl m-0">{t('orderHistory')}</h1>
        </div>

        {isLoading ? (
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-[78px] rounded-xl animate-pulse" style={{ background: 'var(--surface-2)' }} />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16 rounded-[22px] border"
            style={{ background: 'var(--surface)', borderColor: 'var(--line)' }}>
            <span className="text-5xl block mb-4">🧾</span>
            <h3 className="font-sora font-bold text-lg m-0 mb-2">{t('noOrdersYet')}</h3>
            <p className="text-sm mb-4 max-w-xs mx-auto" style={{ color: 'var(--muted)' }}>
              {t('topUpToGetStarted')}
            </p>
            <Link href="/" className="inline-block px-4 py-2 rounded-xl text-sm font-semibold no-underline"
              style={{ background: 'var(--brand)', color: '#fff' }}>{t('browseCatalog')}</Link>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {orders.map((o: any) => {
              const s        = STATUS_STYLE[o.status] ?? STATUS_STYLE.PENDING;
              const product  = o.product ?? {};
              const pkg      = o.package ?? {};
              const date     = new Date(o.createdAt);
              const dateStr  = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

              return (
                <Link key={o.id} href={`/orders/${o.id}`}
                  className="flex items-center gap-3 md:gap-4 p-3.5 md:p-4 rounded-xl border no-underline transition-all hover:-translate-y-0.5"
                  style={{ background: 'var(--surface)', borderColor: 'var(--line)', color: 'var(--ink)', boxShadow: 'var(--shadow-sm)' }}>

                  <div className="w-12 h-12 rounded-xl grid place-items-center font-sora font-extrabold text-base flex-none text-white"
                    style={{ background: `radial-gradient(120% 100% at 30% 20%, ${product.gradFrom ?? '#1d4ed8'}, ${product.gradTo ?? '#0ea5e9'} 60%)` }}>
                    {product.emblem ?? '?'}
                  </div>

                  <div className="flex-1 min-w-0">
                    <b className="block text-[14px] font-semibold truncate">{product.title ?? o.ref}</b>
                    <span className="text-[12px] block truncate" style={{ color: 'var(--muted)' }}>
                      {pkg.amount ? `${pkg.amount.toLocaleString()}${pkg.bonus ? ` +${pkg.bonus}` : ''} ${product.currencyLabel ?? ''}` : o.ref}
                      {' · '}{dateStr}
                    </span>
                    <span className="font-mono text-[10.5px] block" style={{ color: 'var(--muted-2)' }}>{o.ref}</span>
                  </div>

                  <div className="flex flex-col items-end flex-none gap-1">
                    <b className="text-[14px] font-semibold whitespace-nowrap">${(o.totalCents / 100).toFixed(2)}</b>
                    <span className="px-2 py-0.5 rounded-md text-[10.5px] font-semibold whitespace-nowrap"
                      style={{ background: s.bg, color: s.color }}>
                      {s.label}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
