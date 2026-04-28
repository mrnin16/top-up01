'use client';
import { useEffect, useSyncExternalStore } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from './api';
import { getDefault } from './translations';

export type Locale = 'en' | 'km';
export const LOCALES: Locale[] = ['en', 'km'];
export const LOCALE_LABEL: Record<Locale, string> = { en: 'EN', km: 'ខ្មែរ' };

const STORAGE_KEY = 'topup.locale';
const listeners = new Set<() => void>();
let current: Locale | null = null;

function read(): Locale {
  if (typeof window === 'undefined') return 'en';
  if (current) return current;
  const v = window.localStorage.getItem(STORAGE_KEY);
  current = v === 'km' ? 'km' : 'en';
  return current;
}

export function setLocale(loc: Locale) {
  current = loc;
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(STORAGE_KEY, loc);
    document.documentElement.lang = loc;
  }
  listeners.forEach(fn => fn());
}

export function useLocale(): Locale {
  return useSyncExternalStore(
    sub => { listeners.add(sub); return () => { listeners.delete(sub); }; },
    read,
    () => 'en',
  );
}

/**
 * Translation helper. Resolution order (highest → lowest priority):
 *   1. Admin override saved in settings: `text.{key}.{locale}`
 *   2. Admin override saved in English:  `text.{key}.en`
 *   3. Bundled default for current locale (from translations.ts)
 *   4. Bundled English default (from translations.ts)
 *   5. Inline fallback string passed to the call
 *
 * Usage:
 *   const t = useT();
 *   <h1>{t('heroTitle')}</h1>                                  // uses bundled defaults
 *   <h1>{t('heroTitle', 'Top up your favorite games.')}</h1>   // explicit fallback
 */
export function useT() {
  const locale = useLocale();
  const { data } = useQuery({
    queryKey: ['public-settings'],
    queryFn:  api.publicSettings,
    staleTime: 60_000,
  });
  const settings = (data ?? {}) as Record<string, string>;
  return (key: string, fallback = '') => {
    const override   = settings[`text.${key}.${locale}`];
    if (override && override.trim()) return override;
    const overrideEn = settings[`text.${key}.en`];
    if (overrideEn && overrideEn.trim()) return overrideEn;
    const def = getDefault(key, locale);
    if (def) return def;
    return fallback;
  };
}

/** Sync <html lang> to current locale on mount (so screen readers / SEO get it right). */
export function useSyncHtmlLang() {
  const locale = useLocale();
  useEffect(() => { document.documentElement.lang = locale; }, [locale]);
}
