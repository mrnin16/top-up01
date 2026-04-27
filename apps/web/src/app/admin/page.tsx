'use client';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { api } from '@/lib/api';

export default function AdminDashboard() {
  const { data: stats } = useQuery({ queryKey: ['admin-stats'], queryFn: api.admin.stats });

  const cards = [
    { icon: '🧾', label: 'Total orders',     value: stats?.totalOrders        ?? '—', href: '/admin/orders'   },
    { icon: '✅', label: 'Delivered',         value: stats?.deliveredOrders    ?? '—', href: '/admin/orders'   },
    { icon: '💰', label: 'Revenue (USD)',      value: stats ? `$${(stats.totalRevenueCents / 100).toFixed(2)}` : '—', href: '/admin/orders' },
    { icon: '👤', label: 'Total users',       value: stats?.totalUsers         ?? '—', href: '/admin/settings' },
    { icon: '🎮', label: 'Active products',   value: stats?.activeProducts     ?? '—', href: '/admin/products' },
  ];

  return (
    <div className="route-content">
      <h1 className="font-sora font-bold text-2xl mb-6 m-0">Dashboard</h1>

      <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))' }}>
        {cards.map(c => (
          <Link key={c.label} href={c.href}
            className="no-underline p-5 rounded-2xl border transition-all hover:-translate-y-0.5"
            style={{ background: 'var(--surface)', borderColor: 'var(--line)', boxShadow: 'var(--shadow-sm)', color: 'var(--ink)' }}>
            <span className="text-3xl block mb-2">{c.icon}</span>
            <b className="font-sora text-[24px] font-bold block">{c.value}</b>
            <span className="text-[12px]" style={{ color: 'var(--muted)' }}>{c.label}</span>
          </Link>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { icon: '🎮', title: 'Products',  desc: 'Set VIP flags, discounts, upload images', href: '/admin/products' },
          { icon: '⚙️',  title: 'Settings',  desc: 'KHQR image, merchant info, announcements', href: '/admin/settings' },
          { icon: '🧾', title: 'Orders',    desc: 'View all orders, delivery status, users',   href: '/admin/orders'   },
        ].map(q => (
          <Link key={q.href} href={q.href}
            className="no-underline flex items-center gap-4 p-5 rounded-2xl border transition-all hover:-translate-y-0.5"
            style={{ background: 'var(--surface)', borderColor: 'var(--line)', boxShadow: 'var(--shadow-sm)', color: 'var(--ink)' }}>
            <span className="text-3xl">{q.icon}</span>
            <div>
              <b className="font-sora font-bold text-[15px] block">{q.title}</b>
              <span className="text-[12.5px]" style={{ color: 'var(--muted)' }}>{q.desc}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
