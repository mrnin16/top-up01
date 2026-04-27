'use client';
import { useState, Suspense } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { api, setAccessToken, setRefreshToken } from '@/lib/api';
import { useStore } from '@/lib/store';

function RegisterForm() {
  const router  = useRouter();
  const params  = useSearchParams();
  const next    = params.get('next') || '/';
  const setAuth = useStore(s => s.setAuth);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [err,  setErr]  = useState('');

  const register = useMutation({
    mutationFn: async () => {
      const tokens = await api.register(form);
      setAccessToken(tokens.access);
      setRefreshToken(tokens.refresh);
      const me = await api.me();
      return { tokens, me };
    },
    onSuccess: ({ tokens, me }) => {
      setAuth(tokens.access, tokens.refresh, me);
      router.replace(next);
    },
    onError: (e: any) => setErr(e.message ?? 'Registration failed'),
  });

  const valid = form.name.trim().length >= 1 && form.email.includes('@') && form.password.length >= 8;

  return (
    <div className="min-h-screen grid place-items-center px-4" style={{ background: 'var(--bg)' }}>
      <div className="w-full max-w-sm rounded-[22px] p-7 md:p-8"
        style={{ background: 'var(--surface)', border: '1px solid var(--line)', boxShadow: 'var(--shadow-lg)' }}>
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex w-12 h-12 rounded-xl items-center justify-center text-2xl mb-3 no-underline"
            style={{ background: 'linear-gradient(135deg, var(--brand), color-mix(in oklab, var(--brand) 50%, #000))', color: '#fff' }}>
            💎
          </Link>
          <h1 className="font-sora text-[22px] font-bold m-0">Create account</h1>
          <p className="mt-1 text-[13px]" style={{ color: 'var(--muted)' }}>Start topping up in 30 seconds</p>
        </div>

        <div className="flex flex-col gap-3">
          {[
            { key: 'name',     label: 'Full name', type: 'text',     placeholder: 'Lina Sok',         autoComplete: 'name'        },
            { key: 'email',    label: 'Email',     type: 'email',    placeholder: 'you@example.com',  autoComplete: 'email'       },
            { key: 'password', label: 'Password',  type: 'password', placeholder: '8+ characters',     autoComplete: 'new-password' },
          ].map(f => (
            <div key={f.key}>
              <label className="block text-[12px] font-medium mb-1.5" style={{ color: 'var(--ink-2)' }}>{f.label}</label>
              <input
                type={f.type} autoComplete={f.autoComplete}
                className="w-full h-11 px-3.5 rounded-xl border outline-none text-[14px]"
                style={{ background: 'var(--surface)', borderColor: 'var(--line)', color: 'var(--ink)' }}
                placeholder={f.placeholder}
                value={(form as any)[f.key]}
                onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                onKeyDown={e => e.key === 'Enter' && valid && register.mutate()}
              />
            </div>
          ))}
          {err && (
            <p className="text-[12.5px] m-0 p-2.5 rounded-lg"
              style={{ color: 'var(--danger)', background: 'color-mix(in oklab, var(--danger) 8%, var(--surface))' }}>
              {err}
            </p>
          )}
          <button
            onClick={() => register.mutate()}
            disabled={register.isPending || !valid}
            className="w-full h-11 rounded-xl font-semibold text-[14px] mt-1 transition-all"
            style={{
              background: !valid || register.isPending ? 'var(--surface-2)' : 'var(--brand)',
              color:      !valid || register.isPending ? 'var(--muted-2)'    : '#fff',
              boxShadow:  '0 8px 16px -4px color-mix(in oklab, var(--brand) 35%, transparent)',
            }}>
            {register.isPending ? 'Creating…' : 'Create account'}
          </button>
        </div>

        <div className="mt-5 pt-4 text-center text-[13px]" style={{ borderTop: '1px dashed var(--line)', color: 'var(--muted)' }}>
          Have an account?{' '}
          <Link href={`/auth/login${next !== '/' ? `?next=${encodeURIComponent(next)}` : ''}`} className="font-semibold no-underline" style={{ color: 'var(--brand)' }}>
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return <Suspense><RegisterForm /></Suspense>;
}
