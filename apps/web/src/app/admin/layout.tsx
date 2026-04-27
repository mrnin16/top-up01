'use client';
import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useStore } from '@/lib/store';

const NAV = [
  { href: '/admin',           icon: '📊', label: 'Dashboard' },
  { href: '/admin/products',  icon: '🎮', label: 'Products'  },
  { href: '/admin/orders',    icon: '🧾', label: 'Orders'    },
  { href: '/admin/settings',  icon: '⚙️',  label: 'Settings'  },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router   = useRouter();
  const pathname = usePathname();
  const user     = useStore(s => s.user);

  useEffect(() => {
    if (user && user.role !== 'ADMIN') router.replace('/');
    if (!user) router.replace('/auth/login?next=/admin');
  }, [user, router]);

  if (!user || user.role !== 'ADMIN') {
    return (
      <div className="min-h-screen grid place-items-center" style={{ background: 'var(--bg)' }}>
        <p style={{ color: 'var(--muted)' }}>Checking permissions…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg)' }}>
      {/* Sidebar */}
      <aside className="w-56 flex-none flex flex-col border-r"
        style={{ background: 'var(--surface)', borderColor: 'var(--line)' }}>
        <div className="p-5 border-b" style={{ borderColor: 'var(--line)' }}>
          <Link href="/" className="flex items-center gap-2 no-underline" style={{ color: 'var(--ink)' }}>
            <div className="w-8 h-8 rounded-xl grid place-items-center text-white text-lg"
              style={{ background: 'linear-gradient(135deg,var(--brand),color-mix(in oklab,var(--brand) 50%,#000))' }}>💎</div>
            <div>
              <b className="block font-sora text-[15px] font-bold">Top·up</b>
              <span className="text-[11px]" style={{ color: 'var(--muted)' }}>Admin panel</span>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-3 flex flex-col gap-1">
          {NAV.map(n => {
            const active = pathname === n.href || (n.href !== '/admin' && pathname.startsWith(n.href));
            return (
              <Link key={n.href} href={n.href}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13px] font-medium no-underline transition-all"
                style={{
                  background:  active ? 'color-mix(in oklab, var(--brand) 10%, var(--surface-2))' : 'transparent',
                  color:       active ? 'var(--brand)' : 'var(--muted)',
                  fontWeight:  active ? 600 : 500,
                }}>
                <span>{n.icon}</span>{n.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t" style={{ borderColor: 'var(--line)' }}>
          <div className="flex items-center gap-2 px-3 py-2">
            <div className="w-7 h-7 rounded-full grid place-items-center text-white text-xs font-bold"
              style={{ background: 'linear-gradient(135deg,#fbbf24,#ef4444)' }}>
              {user.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <b className="block text-[12px] font-semibold">{user.name}</b>
              <span className="text-[10px] px-1.5 py-0.5 rounded font-semibold uppercase"
                style={{ background: 'var(--accent)', color: '#fff' }}>Admin</span>
            </div>
          </div>
          <Link href="/" className="mt-1 flex items-center gap-2 px-3 py-2 rounded-xl text-[12px] no-underline transition-all"
            style={{ color: 'var(--muted)' }}>← Back to store</Link>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 overflow-auto p-6 md:p-8">{children}</main>
    </div>
  );
}
