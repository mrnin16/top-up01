'use client';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useStore } from '@/lib/store';
import { api, setAccessToken, setRefreshToken, onAuthFailure } from '@/lib/api';
import { SeasonOverlay } from '@/components/layout/SeasonOverlay';

function ThemeBootstrap() {
  const router       = useRouter();
  const pathname     = usePathname();
  const brandColor            = useStore(s => s.brandColor);
  const brandColorCustomized  = useStore(s => s.brandColorCustomized);
  const setBrand              = useStore(s => s.setBrand);
  const dark                  = useStore(s => s.dark);
  const accessToken  = useStore(s => s.accessToken);
  const refreshToken = useStore(s => s.refreshToken);
  const clearAuth    = useStore(s => s.clearAuth);

  // Public platform settings (UI mode, etc.) — no auth, fetched once
  const { data: platform } = useQuery({
    queryKey:  ['public-settings'],
    queryFn:   api.publicSettings,
    staleTime: 60_000,
  });
  const uiMode      = platform?.uiMode ?? 'default';
  const seasonTheme = platform?.seasonTheme ?? 'none';

  // Sync persisted tokens
  useEffect(() => {
    if (accessToken) {
      setAccessToken(accessToken);
      localStorage.setItem('access', accessToken);
    } else {
      setAccessToken(null);
      localStorage.removeItem('access');
    }
  }, [accessToken]);

  useEffect(() => { setRefreshToken(refreshToken); }, [refreshToken]);

  useEffect(() => {
    onAuthFailure(() => {
      clearAuth();
      const next = encodeURIComponent(pathname);
      router.replace(`/auth/login?next=${next}`);
    });
  }, [router, pathname, clearAuth]);

  useEffect(() => {
    document.documentElement.style.setProperty('--brand', brandColor);
  }, [brandColor]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
  }, [dark]);

  // Each season carries its own default brand color so the whole platform stays
  // visually consistent with the current ambient overlay. Users who explicitly
  // picked a color keep theirs (brandColorCustomized=true).
  useEffect(() => {
    if (brandColorCustomized) return;
    const seasonBrand: Record<string, string> = {
      none:   '#2563eb',
      summer: '#f59e0b',
      rain:   '#3b82f6',
      snow:   '#60a5fa',
      knyear: '#dc2626',
      xmas:   '#16a34a',
    };
    const color = seasonBrand[seasonTheme] ?? seasonBrand.none;
    setBrand(color, false); // false = don't mark as user-customized
  }, [seasonTheme, brandColorCustomized, setBrand]);

  // Liquid Glass UI mode — applied platform-wide via attribute on <html>
  useEffect(() => {
    document.documentElement.setAttribute('data-ui-mode', uiMode);
  }, [uiMode]);

  // Season effect — applied platform-wide via attribute on <html>
  useEffect(() => {
    document.documentElement.setAttribute('data-season', seasonTheme);
  }, [seasonTheme]);

  return <SeasonOverlay season={seasonTheme} />;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries:    { staleTime: 60_000, retry: 1, refetchOnWindowFocus: false },
          mutations:  { retry: 0 },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeBootstrap />
      {children}
    </QueryClientProvider>
  );
}
