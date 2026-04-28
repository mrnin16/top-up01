'use client';
import { useState, useRef, useEffect } from 'react';
import { LOCALES, LOCALE_LABEL, useLocale, setLocale, type Locale } from '@/lib/i18n';

interface Props {
  variant?: 'pill' | 'button';
}

export function LanguageToggle({ variant = 'pill' }: Props) {
  const locale = useLocale();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const choose = (loc: Locale) => {
    setLocale(loc);
    setOpen(false);
  };

  const triggerClass = variant === 'pill'
    ? 'flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border text-[12px] font-medium tap-bounce'
    : 'flex items-center gap-1.5 px-3 py-2 rounded-xl border text-[13px] font-medium tap-bounce';

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className={triggerClass}
        style={{ borderColor: 'var(--line)', background: 'var(--surface)', color: 'var(--ink-2)' }}
        aria-label="Change language"
        aria-expanded={open}
      >
        🌐 {LOCALE_LABEL[locale]}
      </button>

      {open && (
        <div
          className="absolute right-0 mt-1.5 min-w-[120px] rounded-xl border overflow-hidden z-50"
          style={{ background: 'var(--surface)', borderColor: 'var(--line)', boxShadow: 'var(--shadow-md)' }}
        >
          {LOCALES.map(loc => (
            <button
              key={loc}
              onClick={() => choose(loc)}
              aria-checked={locale === loc}
              role="radio"
              className="w-full flex items-center justify-between px-3 py-2 text-[13px] font-medium tap-bounce"
              style={{
                background: locale === loc ? 'color-mix(in oklab, var(--brand) 8%, var(--surface))' : 'var(--surface)',
                color:      locale === loc ? 'var(--brand)' : 'var(--ink-2)',
                borderTop:  loc === LOCALES[0] ? 'none' : '1px solid var(--line)',
              }}
            >
              <span>{LOCALE_LABEL[loc]}</span>
              {locale === loc && <span>✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
