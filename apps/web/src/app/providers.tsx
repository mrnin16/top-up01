'use client';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useStore } from '@/lib/store';
import { api, setAccessToken, setRefreshToken, onAuthFailure } from '@/lib/api';

function ThemeBootstrap() {
  const router       = useRouter();
  const pathname     = usePathname();
  const brandColor   = useStore(s => s.brandColor);
  const dark         = useStore(s => s.dark);
  const accessToken  = useStore(s => s.accessToken);
  const refreshToken = useStore(s => s.refreshToken);
  const clearAuth    = useStore(s => s.clearAuth);

  // Public platform settings (UI mode, etc.) — no auth, fetched once
  const { data: platform } = useQuery({
    queryKey:  ['public-settings'],
    queryFn:   api.publicSettings,
    staleTime: 60_000,
  });
  const uiMode = platform?.uiMode ?? 'default';

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

  // Liquid Glass UI mode — applied platform-wide via attribute on <html>
  useEffect(() => {
    document.documentElement.setAttribute('data-ui-mode', uiMode);
  }, [uiMode]);

  return null;
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
