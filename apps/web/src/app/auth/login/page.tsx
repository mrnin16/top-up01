'use client';
import { useState, Suspense } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { api, setAccessToken, setRefreshToken } from '@/lib/api';
import { useStore } from '@/lib/store';

function LoginForm() {
  const router  = useRouter();
  const params  = useSearchParams();
  const next    = params.get('next') || '/';
  const setAuth = useStore(s => s.setAuth);
  const [form, setForm] = useState({ emailOrPhone: '', password: '' });
  const [err,  setErr]  = useState('');

  const login = useMutation({
    mutationFn: async () => {
      const tokens = await api.login(form);
      setAccessToken(tokens.access);
      setRefreshToken(tokens.refresh);
      const me = await api.me();
      return { tokens, me };
    },
    onSuccess: ({ tokens, me }) => {
      setAuth(tokens.access, tokens.refresh, me);
      router.replace(next);
    },
    onError: (e: any) => setErr(e.message ?? 'Login failed'),
  });

  return (
    <div className="min-h-screen grid place-items-center px-4" style={{ background: 'var(--bg)' }}>
      <div className="w-full max-w-sm rounded-[22px] p-7 md:p-8"
        style={{ background: 'var(--surface)', border: '1px solid var(--line)', boxShadow: 'var(--shadow-lg)' }}>
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex w-12 h-12 rounded-xl items-center justify-center text-2xl mb-3 no-underline"
            style={{ background: 'linear-gradient(135deg, var(--brand), color-mix(in oklab, var(--brand) 50%, #000))', color: '#fff' }}>
            💎
          </Link>
          <h1 className="font-sora text-[22px] font-bold m-0">Welcome back</h1>
          <p className="mt-1 text-[13px]" style={{ color: 'var(--muted)' }}>Sign in to your Top-up account</p>
        </div>

        <div className="flex flex-col gap-3">
          <div>
            <label className="block text-[12px] font-medium mb-1.5" style={{ color: 'var(--ink-2)' }}>Email or phone</label>
            <input
              autoFocus autoComplete="email"
              className="w-full h-11 px-3.5 rounded-xl border outline-none text-[14px] transition-all"
              style={{ background: 'var(--surface)', borderColor: 'var(--line)', color: 'var(--ink)' }}
              placeholder="lina@example.com"
              value={form.emailOrPhone}
              onChange={e => setForm({ ...form, emailOrPhone: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-[12px] font-medium mb-1.5" style={{ color: 'var(--ink-2)' }}>Password</label>
            <input
              type="password" autoComplete="current-password"
              className="w-full h-11 px-3.5 rounded-xl border outline-none text-[14px]"
              style={{ background: 'var(--surface)', borderColor: 'var(--line)', color: 'var(--ink)' }}
              placeholder="••••••••"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              onKeyDown={e => e.key === 'Enter' && form.password && login.mutate()}
            />
          </div>
          {err && (
            <p className="text-[12.5px] m-0 p-2.5 rounded-lg"
              style={{ color: 'var(--danger)', background: 'color-mix(in oklab, var(--danger) 8%, var(--surface))' }}>
              {err}
            </p>
          )}
          <button
            onClick={() => login.mutate()}
            disabled={login.isPending || !form.emailOrPhone || !form.password}
            className="w-full h-11 rounded-xl font-semibold text-[14px] mt-1 transition-all"
            style={{
              background: login.isPending || !form.emailOrPhone || !form.password ? 'var(--surface-2)' : 'var(--brand)',
              color:      login.isPending || !form.emailOrPhone || !form.password ? 'var(--muted-2)' : '#fff',
              boxShadow:  '0 8px 16px -4px color-mix(in oklab, var(--brand) 35%, transparent)',
            }}>
            {login.isPending ? 'Signing in…' : 'Sign in'}
          </button>
        </div>

        <div className="mt-5 pt-4 text-center text-[13px]" style={{ borderTop: '1px dashed var(--line)', color: 'var(--muted)' }}>
          No account?{' '}
          <Link href={`/auth/register${next !== '/' ? `?next=${encodeURIComponent(next)}` : ''}`} className="font-semibold no-underline" style={{ color: 'var(--brand)' }}>
            Create one
          </Link>
        </div>

        <p className="mt-4 text-center text-[11.5px]" style={{ color: 'var(--muted-2)' }}>
          Demo: <span className="font-mono">lina@example.com</span> / <span className="font-mono">password123</span>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return <Suspense><LoginForm /></Suspense>;
}
