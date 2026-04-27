'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { api } from '@/lib/api';

const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  PENDING:    { bg: '#f1f3f8', color: '#6b7388' },
  PAID:       { bg: '#e7eeff', color: '#2563eb' },
  DELIVERING: { bg: '#fff7ed', color: '#c2410c' },
  DELIVERED:  { bg: '#dcfce7', color: '#15803d' },
  FAILED:     { bg: '#fee2e2', color: '#dc2626' },
  REFUNDED:   { bg: '#f1f3f8', color: '#6b7388' },
};

export default function AdminOrdersPage() {
  const [page, setPage] = useState(1);
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['admin-orders', page],
    queryFn:  () => api.admin.orders(page),
  });

  return (
    <div className="route-content">
      <h1 className="font-sora font-bold text-2xl mb-6 m-0">All Orders</h1>

      {isLoading ? (
        <div className="flex flex-col gap-2">
          {[1,2,3,4,5].map(i => <div key={i} className="h-14 rounded-xl animate-pulse" style={{ background: 'var(--surface-2)' }} />)}
        </div>
      ) : (
        <div className="rounded-2xl border overflow-hidden" style={{ borderColor: 'var(--line)' }}>
          <table className="w-full text-[13px]">
            <thead>
              <tr style={{ background: 'var(--surface-2)', borderBottom: '1px solid var(--line)' }}>
                {['Ref', 'Product', 'Method', 'User', 'Amount', 'Status', 'Date'].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-semibold text-[11.5px] uppercase tracking-wider" style={{ color: 'var(--muted)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody style={{ background: 'var(--surface)' }}>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center" style={{ color: 'var(--muted)' }}>No orders yet</td>
                </tr>
              ) : orders.map((o: any, i: number) => {
                const s = STATUS_STYLE[o.status] ?? STATUS_STYLE.PENDING;
                return (
                  <tr key={o.id} style={{ borderBottom: i < orders.length - 1 ? '1px solid var(--line)' : 'none' }}
                    className="hover:bg-[var(--surface-2)] transition-colors">
                    <td className="px-4 py-3">
                      <Link href={`/orders/${o.id}`} className="font-mono font-semibold no-underline" style={{ color: 'var(--brand)' }}>
                        {o.ref}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg grid place-items-center font-sora font-bold text-xs text-white flex-none"
                          style={{ background: `radial-gradient(120% 100% at 30% 20%, ${o.product?.gradFrom ?? '#1d4ed8'}, ${o.product?.gradTo ?? '#0ea5e9'})` }}>
                          {o.product?.emblem ?? '?'}
                        </div>
                        <span className="font-medium">{o.product?.title ?? '—'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3" style={{ color: 'var(--muted)' }}>
                      {o.method === 'CODE' ? '📄 Code' : '⚡ Direct'}
                    </td>
                    <td className="px-4 py-3" style={{ color: 'var(--muted)' }}>
                      {o.user ? o.user.email ?? o.user.name : <span style={{ color: 'var(--muted-2)' }}>Guest</span>}
                    </td>
                    <td className="px-4 py-3 font-semibold">
                      ${(o.totalCents / 100).toFixed(2)}
                      {o.discountCents > 0 && <span className="ml-1 text-[11px] font-normal" style={{ color: 'var(--success)' }}>(-${(o.discountCents / 100).toFixed(2)})</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold" style={{ background: s.bg, color: s.color }}>
                        {o.status}
                      </span>
                    </td>
                    <td className="px-4 py-3" style={{ color: 'var(--muted)' }}>
                      {new Date(o.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4">
        <span className="text-[12.5px]" style={{ color: 'var(--muted)' }}>Page {page}</span>
        <div className="flex gap-2">
          <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
            className="px-3 h-8 rounded-lg border text-[12.5px] font-medium transition-all disabled:opacity-40"
            style={{ background: 'var(--surface)', borderColor: 'var(--line)', color: 'var(--ink)' }}>← Prev</button>
          <button disabled={orders.length < 50} onClick={() => setPage(p => p + 1)}
            className="px-3 h-8 rounded-lg border text-[12.5px] font-medium transition-all disabled:opacity-40"
            style={{ background: 'var(--surface)', borderColor: 'var(--line)', color: 'var(--ink)' }}>Next →</button>
        </div>
      </div>
    </div>
  );
}
