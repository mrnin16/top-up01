'use client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useStore } from '@/lib/store';
import { TopNav } from '@/components/layout/TopNav';
import { useT } from '@/lib/i18n';

export default function SavedIdsPage() {
  const router = useRouter();
  const user   = useStore(s => s.user);
  const t      = useT();

  if (!user) {
    return (
      <div className="min-h-screen grid place-items-center" style={{ background: 'var(--bg)' }}>
        <p style={{ color: 'var(--muted)' }}>{t('please')} <Link href="/auth/login" style={{ color: 'var(--brand)' }}>{t('signIn').toLowerCase()}</Link>.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <TopNav query="" onSearch={() => {}} activeRoute="account" />
      <div className="max-w-2xl mx-auto px-6 py-8 route-content">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => router.back()} className="w-9 h-9 rounded-xl border grid place-items-center text-lg"
            style={{ background: 'var(--surface)', borderColor: 'var(--line)' }}>←</button>
          <h1 className="font-sora font-bold text-xl m-0">{t('savedGameIds')}</h1>
        </div>

        <div className="text-center py-16 rounded-[22px] border"
          style={{ background: 'var(--surface)', borderColor: 'var(--line)' }}>
          <span className="text-5xl block mb-4">🎮</span>
          <h3 className="font-sora font-bold text-lg m-0 mb-2">{t('noSavedIds')}</h3>
          <p className="text-sm mb-4 max-w-xs mx-auto" style={{ color: 'var(--muted)' }}>
            {t('autoSaveIds')}
          </p>
          <Link href="/" className="inline-block px-4 py-2 rounded-xl text-sm font-semibold no-underline"
            style={{ background: 'var(--brand)', color: '#fff' }}>{t('topUpAGame')}</Link>
        </div>
      </div>
    </div>
  );
}
