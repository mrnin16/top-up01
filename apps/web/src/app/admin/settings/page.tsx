'use client';
import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { api } from '@/lib/api';

export default function AdminSettingsPage() {
  const qc = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ['admin-settings'],
    queryFn:  api.admin.settings,
    staleTime: Infinity,       // never auto-refetch — user controls saves explicitly
  });

  const [form,          setForm]          = useState<Record<string, string>>({});
  const [uploadStatus,  setUploadStatus]  = useState<'idle' | 'uploading' | 'done' | 'error'>('idle');
  const [uploadError,   setUploadError]   = useState('');
  const [saveMsg,       setSaveMsg]       = useState('');
  const initialized = useRef(false);
  const khqrRef     = useRef<HTMLInputElement>(null);

  // Initialise form ONCE when settings first load — never overwrite local edits
  useEffect(() => {
    if (settings && !initialized.current) {
      setForm(settings as Record<string, string>);
      initialized.current = true;
    }
  }, [settings]);

  const field = (key: string) => form[key] ?? '';
  const set   = (key: string, val: string) => setForm(prev => ({ ...prev, [key]: val }));

  // ── Upload KHQR image ──────────────────────────────────────────────────────
  const uploadKhqr = async (file: File) => {
    // Clear previous status
    setUploadStatus('uploading');
    setUploadError('');
    setSaveMsg('');

    try {
      const res = await api.admin.upload(file);
      set('khqrImageUrl', res.url);
      setUploadStatus('done');
    } catch (err: any) {
      const msg = err?.message ?? 'Upload failed — please try again';
      setUploadError(msg);
      setUploadStatus('error');
      console.error('[KHQR upload]', err);
    }
  };

  // ── Save settings ──────────────────────────────────────────────────────────
  const saveMut = useMutation({
    mutationFn: async () => {
      // Guard: don't save while upload is in-flight
      if (uploadStatus === 'uploading') throw new Error('Please wait for the image to finish uploading');
      return api.admin.updateSettings(form);
    },
    onSuccess: (data) => {
      setForm(data as Record<string, string>);
      qc.setQueryData(['admin-settings'], data);
      // Refresh the public settings query so the UI mode change applies platform-wide
      qc.invalidateQueries({ queryKey: ['public-settings'] });
      setSaveMsg('✅ Settings saved successfully');
      setTimeout(() => setSaveMsg(''), 3000);
    },
    onError: (err: any) => {
      setSaveMsg(`❌ Save failed: ${err?.message ?? 'Unknown error'}`);
    },
  });

  if (isLoading) return (
    <div className="flex flex-col gap-4 max-w-2xl">
      {[1, 2].map(i => <div key={i} className="h-32 rounded-2xl animate-pulse" style={{ background: 'var(--surface-2)' }} />)}
    </div>
  );

  const isBusy = saveMut.isPending || uploadStatus === 'uploading';

  return (
    <div className="route-content max-w-2xl">
      <h1 className="font-sora font-bold text-2xl mb-6 m-0">Platform Settings</h1>

      {/* ── KHQR / Bakong ─────────────────────────────────────────────────── */}
      <section className="p-5 rounded-2xl border mb-4"
        style={{ background: 'var(--surface)', borderColor: 'var(--line)', boxShadow: 'var(--shadow-sm)' }}>
        <h2 className="font-sora font-bold text-[16px] mb-4 m-0">KHQR / Bakong</h2>

        <div className="grid grid-cols-2 gap-5">
          {/* ── KHQR image upload ── */}
          <div>
            <label className="block text-[12px] font-medium mb-2" style={{ color: 'var(--ink-2)' }}>
              KHQR QR image
            </label>

            {/* Upload zone — relative is required for the absolute hover overlay */}
            <div
              className="relative w-full aspect-square max-w-[220px] border-2 border-dashed rounded-xl grid place-items-center cursor-pointer overflow-hidden group transition-all"
              style={{
                borderColor: uploadStatus === 'done'  ? 'var(--success)' :
                             uploadStatus === 'error' ? 'var(--danger)'  :
                             field('khqrImageUrl')    ? 'var(--brand)'   : 'var(--line-strong)',
                background:  'var(--surface-2)',
              }}
              onClick={() => !isBusy && khqrRef.current?.click()}>

              {/* Preview / placeholder */}
              {uploadStatus === 'uploading' ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="w-8 h-8 rounded-full border-4 animate-spin"
                    style={{ borderColor: 'var(--brand)', borderTopColor: 'transparent' }} />
                  <span className="text-[11px]" style={{ color: 'var(--muted)' }}>Uploading…</span>
                </div>
              ) : field('khqrImageUrl') ? (
                <img src={field('khqrImageUrl')} alt="KHQR"
                  className="w-full h-full object-contain"
                  onError={e => {
                    // If the image fails to load (e.g., file was deleted), clear the URL
                    (e.target as HTMLImageElement).style.display = 'none';
                  }} />
              ) : (
                <div className="text-center p-4">
                  <span className="text-4xl block mb-2">⬛</span>
                  <span className="text-[12px]" style={{ color: 'var(--muted)' }}>
                    Click to upload<br/>your KHQR image
                  </span>
                </div>
              )}

              {/* Hover overlay — only when not uploading */}
              {uploadStatus !== 'uploading' && (
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 grid place-items-center transition-opacity">
                  <span className="text-white text-2xl drop-shadow-lg">📷</span>
                </div>
              )}
            </div>

            <input type="file" accept="image/*" className="hidden" ref={khqrRef}
              onChange={e => {
                const f = e.target.files?.[0];
                if (f) uploadKhqr(f);
                // Reset input so the same file can be re-selected
                e.target.value = '';
              }} />

            {/* Status messages below the upload zone */}
            {uploadStatus === 'done' && (
              <p className="text-[11.5px] mt-2 font-medium" style={{ color: 'var(--success)' }}>
                ✓ Image uploaded — click Save to keep it
              </p>
            )}
            {uploadStatus === 'error' && (
              <p className="text-[11.5px] mt-2" style={{ color: 'var(--danger)' }}>
                ✕ {uploadError}
              </p>
            )}
            {uploadStatus === 'idle' && field('khqrImageUrl') && (
              <p className="text-[10.5px] mt-1.5 truncate max-w-[220px]" style={{ color: 'var(--muted)' }}>
                {field('khqrImageUrl').replace(/^https?:\/\/[^/]+/, '')}
              </p>
            )}
            {uploadStatus === 'done' && field('khqrImageUrl') && (
              <button
                className="mt-2 text-[10.5px] font-medium"
                style={{ color: 'var(--muted)' }}
                onClick={() => { set('khqrImageUrl', ''); setUploadStatus('idle'); }}>
                ✕ Remove image
              </button>
            )}
          </div>

          {/* ── KHQR text fields ── */}
          <div className="flex flex-col gap-3">
            {[
              { key: 'khqrMerchantName', label: 'Merchant name',  placeholder: 'Top-up Platform' },
              { key: 'khqrMerchantId',   label: 'Merchant ID',    placeholder: '000000000000000' },
              { key: 'khqrAccountNo',    label: 'Account number', placeholder: '000123456789'    },
              { key: 'khqrCity',         label: 'City',           placeholder: 'Phnom Penh'      },
            ].map(f => (
              <div key={f.key}>
                <label className="block text-[12px] font-medium mb-1" style={{ color: 'var(--ink-2)' }}>{f.label}</label>
                <input
                  className="w-full h-10 px-3 rounded-xl border outline-none text-[13px]"
                  style={{ background: 'var(--surface)', borderColor: 'var(--line)', color: 'var(--ink)' }}
                  placeholder={f.placeholder}
                  value={field(f.key)}
                  onChange={e => set(f.key, e.target.value)}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Appearance / UI mode ────────────────────────────────────────────── */}
      <section className="p-5 rounded-2xl border mb-4"
        style={{ background: 'var(--surface)', borderColor: 'var(--line)', boxShadow: 'var(--shadow-sm)' }}>
        <h2 className="font-sora font-bold text-[16px] mb-1 m-0">Appearance</h2>
        <p className="text-[12.5px] mb-4 mt-0" style={{ color: 'var(--muted)' }}>
          Choose a UI theme — applies platform-wide to every visitor.
        </p>

        <div className="grid grid-cols-3 gap-3">
          {([
            {
              value:    'default',
              label:    'Default',
              icon:     '⚪',
              tag:      null,
              desc:     'Clean & minimal',
              preview:  'linear-gradient(135deg, #f7f8fb, #e6e8ef)',
              accent:   '#2563eb',
            },
            {
              value:    'liquid',
              label:    'Liquid Glass',
              icon:     '💎',
              tag:      'iOS 26',
              desc:     'Frosted glass + vibrant gradients',
              preview:  'linear-gradient(135deg,#ff9a9e,#fad0c4 30%,#a1c4fd 70%,#84fab0)',
              accent:   '#a1c4fd',
            },
            {
              value:    'anime',
              label:    'Anime / Manga',
              icon:     '🌸',
              tag:      'Kawaii',
              desc:     'Manga panels + pastel sticker UI',
              preview:  'linear-gradient(135deg,#ffe4f1,#f3e7ff 50%,#d4f1f9)',
              accent:   '#ff6ec7',
            },
          ] as const).map(opt => {
            const active = field('uiMode') === opt.value || (!field('uiMode') && opt.value === 'default');
            return (
              <button key={opt.value}
                onClick={() => set('uiMode', opt.value)}
                className="relative flex flex-col items-center gap-2 p-3 rounded-2xl border-[1.5px] transition-all duration-150 text-center"
                style={{
                  background:  active ? `color-mix(in oklab, ${opt.accent} 10%, var(--surface))` : 'var(--surface)',
                  borderColor: active ? opt.accent : 'var(--line)',
                  boxShadow:   active ? `0 0 0 3px color-mix(in oklab, ${opt.accent} 22%, transparent)` : 'var(--shadow-sm)',
                  transform:   active ? 'translateY(-1px)' : 'none',
                }}>

                {/* Preview swatch */}
                <div className="w-full h-16 rounded-xl flex items-center justify-center text-2xl border"
                  style={{ background: opt.preview, borderColor: 'rgba(0,0,0,0.06)' }}>
                  <span style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.15))' }}>{opt.icon}</span>
                </div>

                {/* Label + tag */}
                <div className="flex items-center gap-1.5 flex-wrap justify-center">
                  <b className="text-[13px] font-semibold">{opt.label}</b>
                  {opt.tag && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider text-white"
                      style={{ background: opt.accent }}>
                      {opt.tag}
                    </span>
                  )}
                </div>

                {/* Description */}
                <span className="text-[11px] leading-tight" style={{ color: 'var(--muted)' }}>{opt.desc}</span>

                {/* Active check */}
                {active && (
                  <span className="absolute top-2 right-2 w-5 h-5 rounded-full grid place-items-center text-white text-[11px] font-bold"
                    style={{ background: opt.accent }}>✓</span>
                )}
              </button>
            );
          })}
        </div>

        {field('uiMode') && field('uiMode') !== 'default' && (
          <div className="mt-3 p-3 rounded-xl text-[12px]"
            style={{ background: 'color-mix(in oklab, var(--brand) 8%, var(--surface))', border: '1px solid color-mix(in oklab, var(--brand) 25%, var(--line))' }}>
            ✨ Selected: <b>{field('uiMode') === 'liquid' ? 'Liquid Glass' : 'Anime / Manga'}</b> — click <b>"Save all settings"</b> below to apply for all users.
          </div>
        )}
      </section>

      {/* ── Store ──────────────────────────────────────────────────────────── */}
      <section className="p-5 rounded-2xl border mb-4"
        style={{ background: 'var(--surface)', borderColor: 'var(--line)', boxShadow: 'var(--shadow-sm)' }}>
        <h2 className="font-sora font-bold text-[16px] mb-4 m-0">Store</h2>
        <div className="flex flex-col gap-3">
          <div>
            <label className="block text-[12px] font-medium mb-1" style={{ color: 'var(--ink-2)' }}>
              Announcement banner <span style={{ color: 'var(--muted)' }}>(leave empty to hide)</span>
            </label>
            <input
              className="w-full h-10 px-3 rounded-xl border outline-none text-[13px]"
              style={{ background: 'var(--surface)', borderColor: 'var(--line)', color: 'var(--ink)' }}
              placeholder="Diamond Friday — up to 12% bonus!"
              value={field('announcementText')}
              onChange={e => set('announcementText', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-[12px] font-medium mb-1" style={{ color: 'var(--ink-2)' }}>Support email</label>
            <input type="email"
              className="w-full h-10 px-3 rounded-xl border outline-none text-[13px]"
              style={{ background: 'var(--surface)', borderColor: 'var(--line)', color: 'var(--ink)' }}
              placeholder="support@topup.app"
              value={field('supportEmail')}
              onChange={e => set('supportEmail', e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* ── Text & Translations ────────────────────────────────────────────── */}
      <Link href="/admin/translations"
        className="flex items-center justify-between p-5 rounded-2xl border mb-4 no-underline transition-all hover:-translate-y-0.5"
        style={{ background: 'var(--surface)', borderColor: 'var(--line)', boxShadow: 'var(--shadow-sm)', color: 'var(--ink)' }}>
        <div className="flex items-center gap-3">
          <span className="text-2xl">🌐</span>
          <div>
            <b className="font-sora font-bold text-[15px] block">Text &amp; Translations</b>
            <span className="text-[12.5px]" style={{ color: 'var(--muted)' }}>
              Customize all labels in English and Khmer
            </span>
          </div>
        </div>
        <span className="text-lg" style={{ color: 'var(--muted)' }}>→</span>
      </Link>

      {/* ── Save button + status ───────────────────────────────────────────── */}
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

      {uploadStatus === 'uploading' && (
        <div className="mb-3 p-3 rounded-xl text-[12.5px]"
          style={{ background: 'color-mix(in oklab, var(--brand) 8%, var(--surface))', border: '1px solid color-mix(in oklab, var(--brand) 25%, var(--line))', color: 'var(--brand)' }}>
          ⏳ Image is uploading… please wait before saving.
        </div>
      )}

      <button
        onClick={() => saveMut.mutate()}
        disabled={isBusy}
        className={`w-full h-12 rounded-xl font-semibold text-[14px] transition-all${isBusy?' btn-busy':''}`}
        style={{
          background: 'var(--brand)',
          color:      '#fff',
          boxShadow:  isBusy ? 'none' : '0 8px 16px -4px color-mix(in oklab, var(--brand) 35%, transparent)',
        }}>
        {saveMut.isPending ? 'Saving…'
         : uploadStatus === 'uploading' ? 'Wait for upload…'
         : '💾 Save all settings'}
      </button>
    </div>
  );
}
