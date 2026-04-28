'use client';
import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { TRANSLATIONS } from '@/lib/translations';

export default function TranslationsPage() {
  const router = useRouter();
  const qc     = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ['admin-settings'],
    queryFn:  api.admin.settings,
    staleTime: Infinity,
  });

  const [form,    setForm]    = useState<Record<string, string>>({});
  const [saveMsg, setSaveMsg] = useState('');
  const initialized = useRef(false);

  useEffect(() => {
    if (settings && !initialized.current) {
      setForm(settings as Record<string, string>);
      initialized.current = true;
    }
  }, [settings]);

  const field = (key: string) => form[key] ?? '';
  const set   = (key: string, val: string) => setForm(prev => ({ ...prev, [key]: val }));

  const saveMut = useMutation({
    mutationFn: () => api.admin.updateSettings(form),
    onSuccess: (data) => {
      setForm(data as Record<string, string>);
      qc.setQueryData(['admin-settings'], data);
      qc.invalidateQueries({ queryKey: ['public-settings'] });
      setSaveMsg('✅ Translations saved successfully');
      setTimeout(() => setSaveMsg(''), 3000);
    },
    onError: (err: any) => {
      setSaveMsg(`❌ Save failed: ${err?.message ?? 'Unknown error'}`);
    },
  });

  if (isLoading) return (
    <div className="max-w-2xl flex flex-col gap-3">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="h-[88px] rounded-2xl animate-pulse" style={{ background: 'var(--surface-2)' }} />
      ))}
    </div>
  );

  return (
    <div className="max-w-2xl flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()}
          className="w-9 h-9 rounded-xl border grid place-items-center text-lg flex-none"
          style={{ background: 'var(--surface)', borderColor: 'var(--line)' }}>←</button>
        <div>
          <h1 className="font-sora font-bold text-2xl m-0">Text &amp; Translations</h1>
          <p className="text-[12.5px] mt-0.5 m-0" style={{ color: 'var(--muted)' }}>
            Customize labels in English and Khmer. Leave empty to use bundled defaults.
          </p>
        </div>
      </div>

      {/* Translation rows */}
      <div className="flex flex-col gap-2.5 pb-4">
        {Object.entries(TRANSLATIONS).map(([key, defaults]) => (
          <div key={key}
            className="p-4 rounded-2xl border"
            style={{ background: 'var(--surface)', borderColor: 'var(--line)', boxShadow: 'var(--shadow-sm)' }}>
            <div className="text-[11px] font-semibold mb-3 font-mono tracking-wide uppercase"
              style={{ color: 'var(--brand)' }}>
              {key}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[10.5px] mb-1 font-medium" style={{ color: 'var(--muted)' }}>
                  🇬🇧 English
                </label>
                <input
                  className="w-full h-10 px-3 rounded-xl border outline-none text-[13px]"
                  style={{ background: 'var(--bg)', borderColor: 'var(--line)', color: 'var(--ink)' }}
                  placeholder={defaults.en}
                  value={field(`text.${key}.en`)}
                  onChange={e => set(`text.${key}.en`, e.target.value)}
                />
              </div>
              <div>
                <label className="block text-[10.5px] mb-1 font-medium" style={{ color: 'var(--muted)' }}>
                  🇰🇭 ខ្មែរ
                </label>
                <input
                  className="w-full h-10 px-3 rounded-xl border outline-none text-[13px]"
                  style={{ background: 'var(--bg)', borderColor: 'var(--line)', color: 'var(--ink)' }}
                  placeholder={defaults.km}
                  value={field(`text.${key}.km`)}
                  onChange={e => set(`text.${key}.km`, e.target.value)}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Sticky save bar — sticks to the bottom of the scrollable <main> */}
      <div className="sticky bottom-0 py-4 -mx-6 md:-mx-8 px-6 md:px-8"
        style={{
          background:    'color-mix(in oklab, var(--surface) 92%, transparent)',
          borderTop:     '1px solid var(--line)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
        }}>
        {saveMsg && (
          <div className="mb-3 p-3 rounded-xl text-[13px] font-medium"
            style={{
              background: saveMsg.startsWith('✅')
                ? 'color-mix(in oklab, var(--success) 10%, var(--surface))'
                : 'color-mix(in oklab, var(--danger) 10%, var(--surface))',
              border: `1px solid ${saveMsg.startsWith('✅')
                ? 'color-mix(in oklab, var(--success) 30%, var(--line))'
                : 'color-mix(in oklab, var(--danger) 30%, var(--line))'}`,
              color: saveMsg.startsWith('✅') ? 'var(--success)' : 'var(--danger)',
            }}>
            {saveMsg}
          </div>
        )}
        <button
          onClick={() => saveMut.mutate()}
          disabled={saveMut.isPending}
          className={`w-full h-12 rounded-xl font-semibold text-[14px] transition-all${saveMut.isPending ? ' btn-busy' : ''}`}
          style={{
            background: 'var(--brand)',
            color:      '#fff',
            boxShadow:  saveMut.isPending ? 'none' : '0 8px 16px -4px color-mix(in oklab, var(--brand) 35%, transparent)',
          }}>
          {saveMut.isPending ? 'Saving…' : '💾 Save translations'}
        </button>
      </div>
    </div>
  );
}
